// lib/passkeySoroban.ts
import {
  rpc,
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Keypair,
  Address,
} from "@stellar/stellar-sdk";
import { Buffer } from "buffer"; // polyfill p/ browser

/** ===== Config ===== */
const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new rpc.Server(RPC_URL);

/** ===== Constantes de contexto ===== */
export const CREDENTIAL_ID_KEY = "webauthnCredId";
const PASSKEY_WALLET_PUB_KEY = "passkeyWalletPub"; // apenas público (ok salvar)
const INFO_CONTEXT = "ticketcard-ed25519-seed-v1"; // FIXO (não use hostname)

/** ===== Memo do Keypair ===== */
let _memoKP: Keypair | null = null;

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

/** ========== 1) Passkey Registration with PRF enabled ========== */
export async function ensurePasskeyWithPrf(): Promise<string> {
  const existing = getStoredCredentialId();
  if (existing) return existing;

  if (!("PublicKeyCredential" in window)) {
    throw new Error("WebAuthn not supported on this device/browser.");
  }

  try {
    console.log('🔐 Starting passkey registration...');
    
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "TicketCard Passkey", id: window.location.hostname },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: "ticketcard-user",
          displayName: "TicketCard User",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256 (fallback)
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        attestation: "none",
        timeout: 60_000,
        // Tipagem DOM ainda não inclui 'enable'; usar ts-expect-error:
        // @ts-expect-error - PRF 'enable' ainda não tipado
        extensions: { prf: { enable: true } },
      },
    })) as PublicKeyCredential;

    const credentialId = cred.id; // base64url
    localStorage.setItem(CREDENTIAL_ID_KEY, credentialId);
    console.log('✅ Passkey registered successfully:', credentialId);
    return credentialId;
    
  } catch (error: any) {
    console.error('❌ Passkey registration error:', error);
    
    // Handle specific WebAuthn errors
    if (error.name === 'NotAllowedError') {
      throw new Error(
        'Passkey registration was cancelled or not allowed. ' +
        'Please make sure to:\n' +
        '1. Allow the browser to access your authenticator\n' +
        '2. Complete the registration within the timeout period\n' +
        '3. Use a supported authenticator (Touch ID, Face ID, Windows Hello, etc.)\n' +
        '4. Ensure you\'re on a secure connection (HTTPS)'
      );
    } else if (error.name === 'NotSupportedError') {
      throw new Error(
        'Passkey is not supported on this device. ' +
        'Please use a device with biometric authentication or security key support.'
      );
    } else if (error.name === 'SecurityError') {
      throw new Error(
        'Security error during passkey registration. ' +
        'Please ensure you\'re on a secure connection (HTTPS) and try again.'
      );
    } else if (error.name === 'TimeoutError') {
      throw new Error(
        'Passkey registration timed out. ' +
        'Please try again and complete the registration quickly.'
      );
    } else if (error.name === 'AbortError') {
      throw new Error(
        'Passkey registration was cancelled by the user. ' +
        'Please try again if you want to register a passkey.'
      );
    } else {
      throw new Error(
        `Passkey registration failed: ${error.message || 'Unknown error'}. ` +
        'Please try again or contact support if the problem persists.'
      );
    }
  }
}

export function getStoredCredentialId(): string | null {
  return localStorage.getItem(CREDENTIAL_ID_KEY);
}

/** ========== 2) Derive Ed25519 seed via Passkey PRF ========== */
export async function deriveKeyFromPasskey(credentialIdBase64Url: string) {
  if (!("PublicKeyCredential" in window)) {
    throw new Error("WebAuthn not supported.");
  }
  
  try {
    console.log('🔑 Deriving key from passkey...');
    
    const credId = b64ToU8(base64urlToBase64(credentialIdBase64Url));

    // INFO fixo (não depende do hostname)
    const info = new TextEncoder().encode(INFO_CONTEXT);

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
        "PRF not supported/enabled for this credential. Register passkey with PRF."
      );
    }
    
    console.log('✅ Key derived successfully from passkey');
    return new Uint8Array(prfOut); // 32 bytes
    
  } catch (error: any) {
    console.error('❌ Passkey authentication error:', error);
    
    // Handle specific WebAuthn errors
    if (error.name === 'NotAllowedError') {
      throw new Error(
        'Passkey authentication was cancelled or not allowed. ' +
        'Please make sure to:\n' +
        '1. Allow the browser to access your authenticator\n' +
        '2. Complete the authentication within the timeout period\n' +
        '3. Use the same authenticator you registered with\n' +
        '4. Ensure you\'re on a secure connection (HTTPS)'
      );
    } else if (error.name === 'NotSupportedError') {
      throw new Error(
        'Passkey authentication is not supported on this device. ' +
        'Please use a device with biometric authentication or security key support.'
      );
    } else if (error.name === 'SecurityError') {
      throw new Error(
        'Security error during passkey authentication. ' +
        'Please ensure you\'re on a secure connection (HTTPS) and try again.'
      );
    } else if (error.name === 'TimeoutError') {
      throw new Error(
        'Passkey authentication timed out. ' +
        'Please try again and complete the authentication quickly.'
      );
    } else if (error.name === 'AbortError') {
      throw new Error(
        'Passkey authentication was cancelled by the user. ' +
        'Please try again if you want to authenticate.'
      );
    } else {
      throw new Error(
        `Passkey authentication failed: ${error.message || 'Unknown error'}. ` +
        'Please try again or contact support if the problem persists.'
      );
    }
  }
}

/** ========== 3) Generate Stellar Keypair from seed (32 bytes) ========== */
export function generateStellarKeypair(keyMaterial: ArrayBuffer | Uint8Array) {
  const u8 =
    keyMaterial instanceof Uint8Array
      ? keyMaterial
      : new Uint8Array(keyMaterial);
  if (u8.length < 32)
    throw new Error("Invalid seed: 32 bytes required.");
  const seed32 = u8.slice(0, 32);
  const seedBuf = Buffer.from(seed32); // SDK espera Buffer
  return Keypair.fromRawEd25519Seed(seedBuf);
}

/** ========== 4) Memo + persistence of derived pubkey ========== */
async function getPasskeyKeypair(
  credentialIdBase64Url: string
): Promise<Keypair> {
  if (_memoKP) return _memoKP;

  const seed = await deriveKeyFromPasskey(credentialIdBase64Url);
  const kp = generateStellarKeypair(seed);

  const storedPub = localStorage.getItem(PASSKEY_WALLET_PUB_KEY);
  if (!storedPub) {
    localStorage.setItem(PASSKEY_WALLET_PUB_KEY, kp.publicKey());
  } else if (storedPub !== kp.publicKey()) {
    console.warn(
      "[Passkey] Public key changed — possibly new passkey registered or different RP/domain.",
      { before: storedPub, now: kp.publicKey() }
    );
    // Atualiza o stored para o novo pub (opcional)
    localStorage.setItem(PASSKEY_WALLET_PUB_KEY, kp.publicKey());
  }

  _memoKP = kp;
  return kp;
}

/** ========== 5) Ensure balance (testnet) ========== */
export async function ensureFundedOnTestnet(pubKey: string) {
  try {
    await server.getAccount(pubKey); // já existe
  } catch {
    const resp = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(pubKey)}`
    );
    if (!resp.ok) throw new Error(`Friendbot failed: ${await resp.text()}`);
  }
}

/** ========== 6) Invoke contract using Passkey-derived wallet ========== */
export async function invokeWithPasskeyWallet(params: {
  credentialIdBase64Url: string;
  contractId: string;
  method: string;
  args?: any[]; // strings -> ScVal string; Uint8Array -> bytes; demais -> nativo
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

  const STROOP_MULTIPLIER = BigInt("10000000");
  function toStroops(x: number | string | bigint): string {
    const s = typeof x === "bigint" ? x.toString() : String(x).trim();

    if (s.includes(".")) {
      const [intPart, fracPartRaw = ""] = s.split(".");
      const frac = (fracPartRaw + "0000000").slice(0, 7); // completa 7 casas
      return (
        BigInt(intPart || "0") * STROOP_MULTIPLIER +
        BigInt(frac)
      ).toString();
    }

    return (BigInt(s) * STROOP_MULTIPLIER).toString();
  }

  function toAddressScVal(v: string) {
    if (/^[GC][A-Z2-7]{55}$/.test(v)) {
      return new Address(v).toScVal();
    }
    return null;
  }
  const scArgs = (params.args ?? []).map((v, i) => {
    if (typeof v === "string") {
      const addr = toAddressScVal(v);
      if (addr) return addr;

      if (i === 3) {
        // amount passado como string → XLM → stroops (i128)
        return nativeToScVal(toStroops(v), { type: "i128" });
      }
      return nativeToScVal(v, { type: "string" });
    }

    if (v instanceof Uint8Array) {
      return nativeToScVal(v, { type: "bytes" });
    }

    if (typeof v === "number") {
      if (i === 0) {
        // event_id (u64)
        return nativeToScVal(BigInt(v).toString(), { type: "u64" });
      }
      if (i === 3) {
        // amount em XLM (number) → stroops (i128)
        return nativeToScVal(toStroops(v), { type: "i128" });
      }
      return nativeToScVal(v);
    }

    if (typeof v === "bigint") {
      return nativeToScVal(v.toString(), { type: i === 0 ? "u64" : "i128" });
    }

    return nativeToScVal(v);
  });

  // 1) Deterministically derived keypair (memoized)
  const kp = await getPasskeyKeypair(credentialIdBase64Url);

  // 2) Ensure account exists (testnet) - ONLY if not skipFunding
  // NOTE: Contract handles fees, so we don't always need to fund the account
  await ensureFundedOnTestnet(kp.publicKey());

  // 3) Build TX with source = passkey wallet
  // NOTE: Contract handles all fees, including BASE_FEE
  const account = await server.getAccount(kp.publicKey());
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: "100", // Contract pays all fees
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...scArgs))
    .setTimeout(300) // larger window to avoid txTooLate
    .build();

  // 4) Simulate (method/footprint diagnostics)
  const sim = await server.simulateTransaction(tx);
  if (isSimError(sim) || !hasResults(sim)) {
    return {
      status: "SIMULATION_FAILED",
      diag: isSimError(sim)
        ? { error: sim.error, events: (sim as any).events }
        : sim,
    };
  }

  // 5) Prepare (generate footprints) and sign+send
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(kp);
  const sent = await server.sendTransaction(prepared);

  return {
    status: sent.status as SubmitStatus, // "PENDING" | "DUPLICATE" | "TRY_AGAIN_LATER" | "ERROR"
    hash: sent.hash,
    latestLedger: sent.latestLedger,
    publicKey: kp.publicKey(),
    txHashPrepared: u8ToHex(prepared.hash()),
  };
}
