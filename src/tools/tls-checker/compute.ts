import type { TlsCheckerOutputData } from "./types";

/**
 * Raw certificate subject/issuer data from Node's tls.getPeerCertificate().
 * Uses a named interface for strict typing instead of `any`.
 */
export interface RawCertSubject {
  CN?: string;
  O?: string;
  [key: string]: string | undefined;
}

export interface RawCertData {
  subject: RawCertSubject;
  issuer: RawCertSubject;
  valid_from: string;
  valid_to: string;
  serialNumber: string;
}

/**
 * Pure compute function for TLS Certificate Checker.
 * Transforms raw certificate data into typed TlsCheckerOutputData.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeTlsData(
  domain: string,
  cert: RawCertData,
  protocol: string,
): TlsCheckerOutputData {
  const now = new Date();
  const validTo = new Date(cert.valid_to);
  const validFrom = new Date(cert.valid_from);

  const msUntilExpiry = validTo.getTime() - now.getTime();
  const daysUntilExpiry = Math.floor(msUntilExpiry / (1000 * 60 * 60 * 24));
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = !isExpired && daysUntilExpiry < 30;

  return {
    domain,
    subject: {
      CN: cert.subject.CN ?? domain,
      ...(cert.subject.O ? { O: cert.subject.O } : {}),
    },
    issuer: {
      CN: cert.issuer.CN ?? "Unknown",
      ...(cert.issuer.O ? { O: cert.issuer.O } : {}),
    },
    validFrom: validFrom.toISOString(),
    validTo: validTo.toISOString(),
    daysUntilExpiry,
    isExpired,
    isExpiringSoon,
    protocol: protocol || "Unknown",
    serialNumber: cert.serialNumber ?? "",
    checkedAt: now.toISOString(),
  };
}
