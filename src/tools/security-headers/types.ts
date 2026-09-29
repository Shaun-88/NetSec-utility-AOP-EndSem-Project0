/**
 * Type contracts for the Security Header Analyzer Tool.
 */

export type HeaderAuditStatus = "pass" | "warn" | "fail" | "info";

export interface HeaderAuditItem {
  header: string;
  value?: string;
  status: HeaderAuditStatus;
  importance: "Critical" | "High" | "Medium" | "Low";
  description: string;
  recommendation: string;
  pointsEarned: number;
  pointsPossible: number;
}

export interface SecurityHeadersInput {
  target: string;
}

export interface SecurityHeadersOutputData {
  targetUrl: string;
  finalUrl: string;
  statusCode: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  score: number; // 0 to 100
  auditedHeaders: HeaderAuditItem[];
  leakedInfoHeaders: Array<{ header: string; value: string }>;
  rawHeaders: Record<string, string>;
  testedAt: string;
}
