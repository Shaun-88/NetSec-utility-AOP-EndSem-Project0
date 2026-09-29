import type { ValidatedJwtDecoderInput } from "./schema";
import type { JwtDecoderOutputData, JwtClaimDetail, JwtTokenValidation } from "./types";

const STANDARD_CLAIM_DESCRIPTIONS: Record<string, string> = {
  iss: "Issuer (iss): The identity authority that created and issued the token.",
  sub: "Subject (sub): The principal identifier (e.g. user ID or entity).",
  aud: "Audience (aud): Recipient(s) or resource server the token is intended for.",
  exp: "Expiration Time (exp): Unix timestamp after which the token is invalid.",
  nbf: "Not Before (nbf): Unix timestamp before which the token must not be accepted.",
  iat: "Issued At (iat): Unix timestamp when the token was minted.",
  jti: "JWT ID (jti): Unique identifier for one-time token tracking / revocation.",
};

/**
 * Decodes a base64url string into a UTF-8 string safely.
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  if (typeof atob === "function") {
    const raw = atob(base64);
    // Convert byte stream to UTF-8
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // Node.js fallback
  return Buffer.from(base64, "base64").toString("utf-8");
}

function formatRelativeTime(secondsDiff: number): string {
  const abs = Math.abs(secondsDiff);
  const minutes = Math.floor(abs / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let span = "";
  if (days > 0) span = `${days} day${days > 1 ? "s" : ""}`;
  else if (hours > 0) span = `${hours} hour${hours > 1 ? "s" : ""}`;
  else if (minutes > 0) span = `${minutes} min${minutes > 1 ? "s" : ""}`;
  else span = `${abs} sec`;

  return secondsDiff < 0 ? `Expired ${span} ago` : `Expires in ${span}`;
}

/**
 * Pure compute function for JWT Decoder.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 * Accepts an optional reference epoch in seconds for deterministic testing.
 */
export function computeJwtDecode(
  input: ValidatedJwtDecoderInput,
  currentEpochSeconds?: number,
): JwtDecoderOutputData {
  const token = input.token.trim();

  if (!token) {
    return {
      header: {},
      payload: {},
      signature: "",
      rawHeaderBase64: "",
      rawPayloadBase64: "",
      validation: { isExpired: false, isValidStructure: false },
      claimsList: [],
      isValid: false,
      error: "No JWT token provided.",
    };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return {
      header: {},
      payload: {},
      signature: "",
      rawHeaderBase64: parts[0] || "",
      rawPayloadBase64: parts[1] || "",
      validation: { isExpired: false, isValidStructure: false },
      claimsList: [],
      isValid: false,
      error: `Invalid JWT format. Expected 3 dot-separated segments (header.payload.signature), but found ${parts.length}.`,
    };
  }

  const [rawHeader, rawPayload, signature] = parts;
  let header: Record<string, unknown> = {};
  let payload: Record<string, unknown> = {};

  try {
    const headerJson = base64UrlDecode(rawHeader);
    header = JSON.parse(headerJson);
  } catch {
    return {
      header: {},
      payload: {},
      signature,
      rawHeaderBase64: rawHeader,
      rawPayloadBase64: rawPayload,
      validation: { isExpired: false, isValidStructure: false },
      claimsList: [],
      isValid: false,
      error: "Malformed JWT Header: Failed to decode base64url or parse JSON.",
    };
  }

  try {
    const payloadJson = base64UrlDecode(rawPayload);
    payload = JSON.parse(payloadJson);
  } catch {
    return {
      header,
      payload: {},
      signature,
      rawHeaderBase64: rawHeader,
      rawPayloadBase64: rawPayload,
      validation: { isExpired: false, isValidStructure: false },
      claimsList: [],
      isValid: false,
      error: "Malformed JWT Payload: Failed to decode base64url or parse JSON.",
    };
  }

  const nowSec = currentEpochSeconds ?? Math.floor(Date.now() / 1000);

  // Parse claims and validation parameters
  const claimsList: JwtClaimDetail[] = [];
  const expVal = typeof payload.exp === "number" ? payload.exp : undefined;
  const iatVal = typeof payload.iat === "number" ? payload.iat : undefined;
  const nbfVal = typeof payload.nbf === "number" ? payload.nbf : undefined;

  let isExpired = false;
  let timeRemaining: string | undefined;

  if (expVal !== undefined) {
    isExpired = expVal < nowSec;
    timeRemaining = formatRelativeTime(expVal - nowSec);
  }

  for (const [key, value] of Object.entries(payload)) {
    let formattedDate: string | undefined;
    if (["exp", "iat", "nbf", "auth_time"].includes(key) && typeof value === "number") {
      try {
        formattedDate = new Date(value * 1000).toUTCString();
      } catch {
        // Ignore date parse issues
      }
    }

    claimsList.push({
      claim: key,
      value,
      description: STANDARD_CLAIM_DESCRIPTIONS[key] || "Custom application claim parameter.",
      formattedDate,
    });
  }

  const validation: JwtTokenValidation = {
    isExpired,
    isValidStructure: true,
    algorithm: typeof header.alg === "string" ? header.alg : undefined,
    issuedAt: iatVal ? new Date(iatVal * 1000).toUTCString() : undefined,
    expiresAt: expVal ? new Date(expVal * 1000).toUTCString() : undefined,
    notBefore: nbfVal ? new Date(nbfVal * 1000).toUTCString() : undefined,
    timeRemaining,
  };

  return {
    header,
    payload,
    signature,
    rawHeaderBase64: rawHeader,
    rawPayloadBase64: rawPayload,
    validation,
    claimsList,
    isValid: true,
  };
}
