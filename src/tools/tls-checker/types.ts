/**
 * Type contracts for the TLS/SSL Certificate Checker Tool.
 */

export interface TlsCheckerOutputData {
  domain: string;
  subject: { CN: string; O?: string };
  issuer: { CN: string; O?: string };
  validFrom: string;
  validTo: string;
  daysUntilExpiry: number;
  isExpired: boolean;
  /** True if cert expires within 30 days */
  isExpiringSoon: boolean;
  /** e.g. "TLSv1.3" */
  protocol: string;
  serialNumber: string;
  checkedAt: string;
}
