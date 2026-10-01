/**
 * Type contracts for the Website Security Report Tool.
 * Aggregates DNS, TLS, Security Headers, and WHOIS results into one composite report.
 */

export interface SubToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface WebsiteSecurityReportData {
  domain: string;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  score: number;
  subResults: {
    dns: SubToolResult;
    headers: SubToolResult;
    tls: SubToolResult;
    whois: SubToolResult;
  };
  ranAt: string;
}
