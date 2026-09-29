import { ALLOWED_PORTS } from "./schema";
import type { PortCheckerData, PortStatus } from "./types";

/**
 * Generates security posture guidance based on port type and reachability status.
 */
function getSecurityRecommendation(port: number, status: PortStatus): string {
  if (status === "closed" || status === "filtered") {
    return `Port ${port} is ${status}. Incoming external connections are blocked or no listening daemon responded.`;
  }

  // If port is open, provide specific guidance
  if (port === 3306 || port === 5432) {
    return `Caution: Database port ${port} is directly reachable over the public internet. Ensure strong authentication, TLS encryption, and consider binding to localhost or behind a VPN/bastion host.`;
  }

  if (port === 21) {
    return `Warning: Unencrypted FTP (port 21) transmits credentials in plaintext. Migrate to SFTP (port 22) or FTPS (port 990).`;
  }

  if (port === 22) {
    return `SSH service active on port 22. Ensure password authentication is disabled in favor of Ed25519/RSA keypairs and Fail2ban is active.`;
  }

  if (port === 80) {
    return `Port 80 (HTTP) is open. Ensure an automatic 301/308 redirect to HTTPS (port 443) with HSTS is enabled.`;
  }

  if (port === 443) {
    return `Port 443 (HTTPS) is responding. Ensure modern TLS 1.3 / 1.2 ciphers and valid CA-signed certificates are in place.`;
  }

  return `Service on port ${port} is operational and accepting TCP handshakes.`;
}

/**
 * Pure compute function for Port Checker.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computePortCheckerData(
  target: string,
  resolvedIp: string,
  port: number,
  status: PortStatus,
  latencyMs: number,
): PortCheckerData {
  const portDef = ALLOWED_PORTS.find((p) => p.port === port) || {
    service: "Custom",
    category: "Infrastructure" as const,
    description: `TCP Port ${port}`,
  };

  return {
    target,
    resolvedIp,
    port,
    serviceName: portDef.service,
    serviceCategory: portDef.category,
    serviceDescription: portDef.description,
    status,
    latencyMs: Math.round(latencyMs * 10) / 10,
    securityRecommendation: getSecurityRecommendation(port, status),
    checkedAt: new Date().toISOString(),
  };
}
