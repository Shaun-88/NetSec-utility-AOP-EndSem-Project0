/**
 * Type contracts for the JWT Decoder Tool.
 */

export interface JwtClaimDetail {
  claim: string;
  value: unknown;
  description: string;
  formattedDate?: string;
}

export interface JwtTokenValidation {
  isExpired: boolean;
  isValidStructure: boolean;
  algorithm?: string;
  issuedAt?: string;
  expiresAt?: string;
  notBefore?: string;
  timeRemaining?: string;
}

export interface JwtDecoderOutputData {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  rawHeaderBase64: string;
  rawPayloadBase64: string;
  validation: JwtTokenValidation;
  claimsList: JwtClaimDetail[];
  isValid: boolean;
  error?: string;
}
