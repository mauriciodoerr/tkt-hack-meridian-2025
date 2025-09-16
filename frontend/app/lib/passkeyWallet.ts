// lib/passkeyWallet.ts
import {
  rpc,
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Keypair,
} from "@stellar/stellar-sdk";
import { Buffer } from "buffer"; // polyfill p/ browser

const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new rpc.Server(RPC_URL);

/** ===== Helpers ===== */
const base64urlToBase64 = (s: string) => {
  let b = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b.length % 4) b += "=";
  return b;
};
const b64ToU8 = (b64: string) => {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};
const u8ToHex = (u8: Uint8Array) =>
  Array.from(u8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

// type-guards para o union de simulateTransaction
function isSimError(resp: any): resp is { error: any; events?: any[] } {
  return resp && typeof resp === "object" && "error" in resp;
}
function hasResults(resp: any): resp is { results: any[] } {
  return resp && typeof resp === "object" && "result" in resp;
}

// Status possíveis de envio (sendTransaction)
export type SubmitStatus =
  | "PENDING"
  | "DUPLICATE"
  | "TRY_AGAIN_LATER"
  | "ERROR";

/** ===== 1) Deriva 32 bytes via PRF do passkey ===== */
export async function deriveKeyFromPasskey(credentialIdBase64Url: string) {
  if (!("PublicKeyCredential" in window)) {
    throw new Error("WebAuthn não suportado.");
  }
  const credId = b64ToU8(base64urlToBase64(credentialIdBase64Url));

  // "info"/escopo de derivação: amarre ao domínio e versão
  const info = new TextEncoder().encode(
    `stellar-ed25519-seed-v1|${window.location.hostname}`
  );

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ type: "public-key", id: credId }],
      userVerification: "required",
      timeout: 60_000,
      extensions: { prf: { eval: { first: info } } },
    },
  })) as PublicKeyCredential;

  const exts: any = (assertion as any).getClientExtensionResults?.();
  const prfOut: ArrayBuffer | undefined = exts?.prf?.results?.first;
  if (!prfOut) {
    throw new Error(
      "PRF não suportado/habilitado para esta credencial. Registre a passkey com PRF."
    );
  }
  return new Uint8Array(prfOut); // 32 bytes
}

/** ===== 2) Gera Keypair Stellar a partir da seed derivada (32 bytes) ===== */
export function generateStellarKeypair(keyMaterial: ArrayBuffer | Uint8Array) {
  const u8 =
    keyMaterial instanceof Uint8Array
      ? keyMaterial
      : new Uint8Array(keyMaterial);

  if (u8.length < 32) {
    throw new Error("Seed inválida: são necessários 32 bytes.");
  }

  const seed32 = u8.slice(0, 32);
  const seedBuf = Buffer.from(seed32); // SDK espera Buffer
  return Keypair.fromRawEd25519Seed(seedBuf);
}

/** ===== 3) Garante saldo (testnet) ===== */
export async function ensureFundedOnTestnet(pubKey: string) {
  try {
    await server.getAccount(pubKey); // já existe
  } catch {
    const resp = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(pubKey)}`
    );
    if (!resp.ok) {
      throw new Error(`Friendbot falhou: ${await resp.text()}`);
    }
  }
}

/** ===== 4) Invoca contrato com a wallet derivada do Passkey ===== */
export async function invokeWithPasskeyWallet(params: {
  credentialIdBase64Url: string;
  contractId: string;
  method: string;
  args?: any[]; // strings viram ScVal string; Uint8Array vira bytes; demais nativo
}): Promise<
  | { status: "SIMULATION_FAILED"; diag: any }
  | {
      status: SubmitStatus;
      hash: string;
      latestLedger?: number;
      publicKey: string;
      txHashPrepared: string;
    }
> {
  const { credentialIdBase64Url, contractId, method } = params;
  const args = (params.args ?? []).map((v) =>
    typeof v === "string"
      ? nativeToScVal(v, { type: "string" })
      : v instanceof Uint8Array
      ? nativeToScVal(v, { type: "bytes" })
      : nativeToScVal(v)
  );

  // 1) Deriva seed e cria Keypair
  const seed = await deriveKeyFromPasskey(credentialIdBase64Url);
  const kp = generateStellarKeypair(seed);

  // 2) Garante que a conta exista (testnet)
  await ensureFundedOnTestnet(kp.publicKey());

  // 3) Monta tx com source = wallet do passkey
  const account = await server.getAccount(kp.publicKey());
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30000)
    .build();

  // (opcional) simular para diagnosticar antes
  const sim = await server.simulateTransaction(tx);
  if (isSimError(sim) || !hasResults(sim)) {
    return {
      status: "SIMULATION_FAILED",
      diag: isSimError(sim)
        ? { error: sim.error, events: (sim as any).events }
        : sim,
    };
  }

  // 4) Prepare footprints etc.
  const prepared = await server.prepareTransaction(tx);

  // 5) Assina com a chave Ed25519 derivada do passkey e envia
  prepared.sign(kp);
  const sent = await server.sendTransaction(prepared);

  return {
    status: sent.status as SubmitStatus,
    hash: sent.hash,
    latestLedger: sent.latestLedger,
    publicKey: kp.publicKey(),
    txHashPrepared: u8ToHex(prepared.hash()),
  };
}
