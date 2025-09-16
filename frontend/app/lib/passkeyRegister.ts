// lib/passkeyRegister.ts
export const CREDENTIAL_ID_KEY = "webauthnCredId";

/**
 * Garante que existe uma credencial WebAuthn com PRF habilitado.
 * Retorna o credentialId (base64url) para usar na derivação da wallet.
 */
export async function ensurePasskeyWithPrf(): Promise<string> {
  const existing = getStoredCredentialId();
  if (existing) return existing;

  if (!("PublicKeyCredential" in window)) {
    throw new Error("WebAuthn não suportado neste dispositivo/navegador.");
  }

  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "TicketCard Passkey", id: window.location.hostname },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)), // ID único do seu usuário
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
      // Tipagem DOM ainda não inclui 'enable'; usamos ts-expect-error.
      // @ts-expect-error - PRF 'enable' ainda não tipado
      extensions: { prf: { enable: true } },
    },
  })) as PublicKeyCredential;

  const credentialId = cred.id; // base64url
  localStorage.setItem(CREDENTIAL_ID_KEY, credentialId);
  return credentialId;
}

export function getStoredCredentialId(): string | null {
  return localStorage.getItem(CREDENTIAL_ID_KEY);
}
