import type { ValidatedJwtDecoderInput } from "./schema";
import type { JwtDecoderOutputData, JwtClaimDetail, JwtTokenValidation } from "./types";

const STANDARD_CLAIM_DESCRIPTIONS: Record<string, string> = {
  iss: "Issuer (iss): The identity authority that issued the token.",
  sub: "Subject (sub): The unique identifier of the user or entity.",
  aud: "Audience (aud): The intended recipient or resource server.",
  exp: "Expiration Time (exp): Unix timestamp after which the token expires.",
  nbf: "Not Before (nbf): Unix timestamp before which the token must not be accepted.",
  iat: "Issued At (iat): Unix timestamp when the token was created.",
  jti: "JWT ID (jti): Unique token identifier used for revocation or single-use verification.",
  name: "Name (name): Full display name of the subject.",
  email: "Email (email): Email address of the user.",
  role: "Role (role): Access control or permission level of the subject.",
  roles: "Roles (roles): Array of permission roles assigned to the subject.",
  auth_time: "Authentication Time (auth_time): Time when the user originally authenticated.",
};

/**
 * Strips Bearer prefixes, quotes, and whitespace from token input strings.
 */
export function cleanTokenInput(raw: string): string {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^["']|["']$/g, "").trim();
  if (cleaned.toLowerCase().startsWith("bearer ")) {
    cleaned = cleaned.slice(7).trim();
  }
  return cleaned;
}

/**
 * Decodes a base64url string into a UTF-8 string safely.
 */
export function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  if (typeof atob === "function") {
    const raw = atob(base64);
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // Node.js fallback
  return Buffer.from(base64, "base64").toString("utf-8");
}

export function formatRelativeTime(secondsDiff: number): string {
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
  const token = cleanTokenInput(input.token || "");

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
      error: "No JWT token provided. Paste a 3-part token (header.payload.signature) to decode.",
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
    const parsed = JSON.parse(headerJson);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Not a JSON object");
    }
    header = parsed;
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
      error: "Malformed JWT Header: Failed to decode base64url or parse JSON object.",
    };
  }

  try {
    const payloadJson = base64UrlDecode(rawPayload);
    const parsed = JSON.parse(payloadJson);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Not a JSON object");
    }
    payload = parsed;
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
      error: "Malformed JWT Payload: Failed to decode base64url or parse JSON object.",
    };
  }

  const nowSec = currentEpochSeconds ?? Math.floor(Date.now() / 1000);

  // Parse claims and validation parameters
  const claimsList: JwtClaimDetail[] = [];

  const parseEpoch = (val: unknown): number | undefined => {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string") {
      const num = parseInt(val, 10);
      if (!isNaN(num)) return num;
    }
    return undefined;
  };

  const expVal = parseEpoch(payload.exp);
  const iatVal = parseEpoch(payload.iat);
  const nbfVal = parseEpoch(payload.nbf);

  let isExpired = false;
  let timeRemaining: string | undefined;

  if (expVal !== undefined) {
    isExpired = expVal < nowSec;
    timeRemaining = formatRelativeTime(expVal - nowSec);
  }

  for (const [key, value] of Object.entries(payload)) {
    let formattedDate: string | undefined;
    const epochNum = parseEpoch(value);
    if (["exp", "iat", "nbf", "auth_time"].includes(key) && epochNum !== undefined) {
      try {
        formattedDate = new Date(epochNum * 1000).toUTCString();
      } catch {
        // Ignore date parse issues
      }
    }

    const isStandardClaim = Object.prototype.hasOwnProperty.call(STANDARD_CLAIM_DESCRIPTIONS, key);

    claimsList.push({
      claim: key,
      value,
      description: STANDARD_CLAIM_DESCRIPTIONS[key] || "Custom application claim parameter.",
      formattedDate,
      isStandardClaim,
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
