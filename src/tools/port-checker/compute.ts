import { ALLOWED_PORTS } from "./schema";
import type { PortCheckerData, PortStatus } from "./types";

/**
 * Explains the diagnostic meaning of each port reachability state in clear plain language.
 */
export function getStatusMeaning(status: PortStatus): string {
  switch (status) {
    case "open":
      return "The target machine accepted the TCP handshake. An active service is running and welcoming incoming connections on this port.";
    case "closed":
      return "The target host is online and actively replied with a TCP Reset (RST). The computer is reachable, but no application is currently listening on this port.";
    case "filtered":
      return "No response packet arrived within the 3.0-second timeout window. The packet was likely silently dropped or blocked by a network firewall, router rule, or ISP filter.";
  }
}

/**
 * Generates security posture guidance based on port type and reachability status.
 */
export function getSecurityRecommendation(port: number, status: PortStatus): string {
  if (status === "closed") {
    if (port === 3306 || port === 5432) {
      return `Good security posture: Database port ${port} is closed to external connections. This prevents unauthorized internet queries.`;
    }
    if (port === 80 || port === 443) {
      return `Web service port ${port} is closed. If you are hosting a website, check that your web server software (e.g. Nginx, Apache) is started and bound to 0.0.0.0.`;
    }
    if (port === 22) {
      return `SSH port 22 is closed. If this is your server, verify that the sshd service is active and listening on the expected network interface.`;
    }
    return `Port ${port} is closed. The target machine responded, confirming no service is listening or an active reject rule is configured.`;
  }

  if (status === "filtered") {
    if (port === 3306 || port === 5432) {
      return `Excellent security posture: Database port ${port} is filtered. A firewall is silently dropping external traffic before reaching the server.`;
    }
    if (port === 80 || port === 443) {
      return `Web traffic to port ${port} timed out (filtered). If you expect this website to be public, check your cloud security groups (AWS, GCP, DigitalOcean), OS firewall (UFW/iptables), or router port forwarding.`;
    }
    if (port === 22) {
      return `SSH traffic to port ${port} timed out (filtered). Check if your IP is whitelisted in your server's firewall or if the cloud security group permits incoming port 22.`;
    }
    return `Port ${port} timed out (filtered). Incoming packets are being silently dropped by an upstream firewall, cloud security group, or ISP.`;
  }

  // If port is open, provide specific guidance
  if (port === 3306 || port === 5432) {
    return `Caution: Database port ${port} is directly reachable over the public internet. Ensure strong authentication, TLS encryption, and consider binding to localhost, a private VPC, or behind a VPN/bastion host.`;
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

  if (port === 25) {
    return `SMTP relay port 25 is open. Ensure your server is not configured as an open relay, which spammers exploit to send bulk junk mail.`;
  }

  if (port === 8080) {
    return `Alternate web port 8080 is reachable. If this is a development server or internal admin dashboard, protect it with authentication.`;
  }

  if (port === 8443) {
    return `Alternate secure web port 8443 is accepting connections. Verify TLS certificate validity and enforce MFA for administrative panels.`;
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
    port,
    service: "Custom",
    category: "Infrastructure" as const,
    description: `TCP Port ${port}`,
    plainExplanation: `Standard TCP network port ${port}.`,
    useCase: `General network diagnostic check for port ${port}.`,
  };

  return {
    target,
    resolvedIp,
    port,
    serviceName: portDef.service,
    serviceCategory: portDef.category,
    serviceDescription: portDef.description,
    plainExplanation: portDef.plainExplanation,
    useCase: portDef.useCase,
    status,
    statusMeaning: getStatusMeaning(status),
    latencyMs: Math.round(latencyMs * 10) / 10,
    securityRecommendation: getSecurityRecommendation(port, status),
    checkedAt: new Date().toISOString(),
  };
}
