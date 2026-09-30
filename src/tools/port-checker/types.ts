/**
 * Type contracts for the Port Checker Tool.
 */

export interface AllowedPortDefinition {
  port: number;
  service: string;
  category: "Web" | "Remote Access" | "Mail" | "Database" | "Infrastructure";
  description: string;
  plainExplanation: string;
  useCase: string;
  securityNote?: string;
}

export interface PortCheckerInput {
  target: string;
  port: number;
}

export type PortStatus = "open" | "closed" | "filtered";

export interface PortCheckerData {
  target: string;
  resolvedIp: string;
  port: number;
  serviceName: string;
  serviceCategory: string;
  serviceDescription: string;
  plainExplanation: string;
  useCase: string;
  status: PortStatus;
  statusMeaning: string;
  latencyMs: number;
  securityRecommendation: string;
  checkedAt: string;
}
