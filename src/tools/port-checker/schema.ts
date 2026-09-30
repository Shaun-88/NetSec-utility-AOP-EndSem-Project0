import { z } from "zod";
import type { AllowedPortDefinition } from "./types";

export const ALLOWED_PORTS: AllowedPortDefinition[] = [
  {
    port: 21,
    service: "FTP",
    category: "Infrastructure",
    description: "File Transfer Protocol",
    plainExplanation: "An older protocol designed to transfer files between computers. It transmits login passwords and file contents without encryption.",
    useCase: "Check if an FTP file repository, legacy backup server, or network-attached storage (NAS) is publicly reachable.",
    securityNote: "Cleartext passwords are vulnerable to eavesdropping. Modern systems should replace FTP with SFTP (port 22) or FTPS.",
  },
  {
    port: 22,
    service: "SSH",
    category: "Remote Access",
    description: "Secure Shell Remote Administration",
    plainExplanation: "An encrypted terminal connection used by system administrators to securely log in and manage Linux/Unix servers and cloud virtual machines.",
    useCase: "Confirm your cloud server (e.g. AWS EC2, DigitalOcean, Linode) or Raspberry Pi is accepting remote administrator logins.",
    securityNote: "Disable password authentication in favor of cryptographic SSH keys, and consider fail2ban to stop automated brute-force attacks.",
  },
  {
    port: 25,
    service: "SMTP",
    category: "Mail",
    description: "Simple Mail Transfer Protocol",
    plainExplanation: "The primary pipeline mail servers use to deliver emails to one another across the internet. Most home internet providers block this port to curb spam.",
    useCase: "Verify that your dedicated business mail server can receive inbound email transfers from external mail providers.",
    securityNote: "Residential ISPs almost universally block port 25 to stop malware botnets from spewing spam. Use port 587 for sending personal emails.",
  },
  {
    port: 53,
    service: "DNS",
    category: "Infrastructure",
    description: "Domain Name System",
    plainExplanation: "The internet's phonebook service, converting human-friendly website names (such as google.com) into numerical IP addresses.",
    useCase: "Check if a custom or public DNS nameserver (like Pi-hole, BIND, or Cloudflare DNS) is responding over TCP.",
    securityNote: "While everyday DNS lookups use UDP, TCP port 53 is required for large DNS responses, zone transfers, and DNSSEC validation.",
  },
  {
    port: 80,
    service: "HTTP",
    category: "Web",
    description: "Standard Web Server",
    plainExplanation: "The foundational protocol of the World Wide Web for delivering standard unencrypted web pages. Most modern sites redirect this to secure HTTPS.",
    useCase: "Confirm your web server software (such as Nginx, Apache, or Caddy) is running and welcoming visitors.",
    securityNote: "Standard HTTP does not encrypt traffic. Configure an automatic 301 redirect to port 443 (HTTPS) with HSTS headers enabled.",
  },
  {
    port: 110,
    service: "POP3",
    category: "Mail",
    description: "Post Office Protocol v3",
    plainExplanation: "A legacy email protocol that downloads messages from a mail server directly onto a single device, usually removing them from the server.",
    useCase: "Test if an older mail server's incoming POP3 mailbox service is accepting connections.",
    securityNote: "Standard POP3 sends credentials in plaintext. Modern setups should migrate to encrypted POP3S (port 995) or IMAPS (port 993).",
  },
  {
    port: 143,
    service: "IMAP",
    category: "Mail",
    description: "Internet Message Access Protocol",
    plainExplanation: "The standard email protocol that keeps your inbox, sent items, and folders synchronized across all your devices (phone, laptop, tablet).",
    useCase: "Verify that an email server's mailbox synchronization daemon is reachable over the network.",
    securityNote: "Unencrypted IMAP transmits account passwords openly. Always enforce encrypted IMAPS (port 993) or STARTTLS.",
  },
  {
    port: 443,
    service: "HTTPS",
    category: "Web",
    description: "Encrypted Web Server (TLS/SSL)",
    plainExplanation: "The secure version of HTTP used by virtually all websites today. All traffic, logins, credit card details, and personal data are encrypted.",
    useCase: "Confirm your secure website or web API is reachable from the outside internet and responding over TLS/SSL.",
    securityNote: "The modern gold standard for web traffic. Ensure your SSL/TLS certificates are valid and renewed automatically via Let's Encrypt.",
  },
  {
    port: 465,
    service: "SMTPS",
    category: "Mail",
    description: "Encrypted Mail Submission",
    plainExplanation: "A secure protocol used by email clients (such as mobile mail apps or desktop software) to submit outgoing mail over an encrypted TLS tunnel.",
    useCase: "Verify that your mail server allows authenticated users to submit outbound email with immediate TLS encryption.",
    securityNote: "Guarantees that your email messages and mailbox credentials are encrypted from the very first handshake.",
  },
  {
    port: 587,
    service: "Submission",
    category: "Mail",
    description: "Authenticated SMTP Relaying",
    plainExplanation: "The modern standard port for sending outgoing mail from personal email apps. Requires client authentication and starts TLS encryption.",
    useCase: "Confirm your mail server is ready to accept outbound emails from authenticated user applications like Outlook or Apple Mail.",
    securityNote: "Bypasses residential ISP port 25 blocks and requires user credentials, preventing unauthorized relay spam.",
  },
  {
    port: 993,
    service: "IMAPS",
    category: "Mail",
    description: "Encrypted IMAP",
    plainExplanation: "The encrypted version of IMAP. It keeps your email inbox synchronized while preventing eavesdroppers on public Wi-Fi from reading your messages.",
    useCase: "Check whether your mail server is safely serving synchronized mailboxes to mobile and desktop email apps over TLS.",
    securityNote: "The industry standard port for secure mailbox access across multiple devices.",
  },
  {
    port: 995,
    service: "POP3S",
    category: "Mail",
    description: "Encrypted POP3",
    plainExplanation: "The secure version of POP3. It downloads messages from the mail server to your personal computer over an encrypted TLS connection.",
    useCase: "Test secure single-device mailbox downloading on a private or corporate mail server.",
    securityNote: "Protects POP3 account credentials and email contents in transit against interception.",
  },
  {
    port: 3306,
    service: "MySQL",
    category: "Database",
    description: "MySQL / MariaDB Database Server",
    plainExplanation: "The communication port used by MySQL and MariaDB databases to store, query, and manage structured application records.",
    useCase: "Verify if your database is listening, or confirm that your firewall successfully blocks external internet access to keep it private.",
    securityNote: "High exposure risk: Databases should almost never be exposed to the public internet. Restrict access to localhost or an internal VPN.",
  },
  {
    port: 5432,
    service: "PostgreSQL",
    category: "Database",
    description: "PostgreSQL Database Server",
    plainExplanation: "The default port used by PostgreSQL databases for connecting application backends, ORMs, and administrative database tools.",
    useCase: "Verify if your PostgreSQL database instance is accessible, or confirm your security rules prevent public internet connections.",
    securityNote: "High exposure risk: Shield database ports behind private subnet VPCs or require SSH bastions to guard against brute-force attacks.",
  },
  {
    port: 8080,
    service: "HTTP-Alt",
    category: "Web",
    description: "Alternate Web / Proxy Port",
    plainExplanation: "A widely used secondary web port for development servers, staging environments, internal dashboards, and proxies like Tomcat or Jenkins.",
    useCase: "Check if a development web application, staging container, or proxy service is accessible over the network.",
    securityNote: "Commonly used for staging environments and admin dashboards. Ensure access is protected with strong authentication and TLS.",
  },
  {
    port: 8443,
    service: "HTTPS-Alt",
    category: "Web",
    description: "Alternate Secure Web Port",
    plainExplanation: "A secondary port for secure encrypted web traffic. Often used for administrative consoles, router portals, and secondary HTTPS applications.",
    useCase: "Confirm reachability for secure administrative dashboards, router portals, or secondary SSL/TLS web applications.",
    securityNote: "Verify that valid SSL/TLS certificates are active and that administrative dashboards enforce multi-factor authentication.",
  },
];

export const ALLOWED_PORT_NUMBERS = ALLOWED_PORTS.map((p) => p.port);

export function cleanHost(val: string): string {
  let cleaned = val.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, "");
  // Remove path and query parameters
  cleaned = cleaned.split("/")[0].split("?")[0];

  // If wrapped in IPv6 brackets e.g. [2001:db8::1] or [2001:db8::1]:443
  const bracketMatch = cleaned.match(/^\[([a-f0-9:]+)\](?::\d+)?$/);
  if (bracketMatch) {
    return bracketMatch[1];
  }

  // If it's a domain or IPv4 with a single trailing port (e.g. host:port), strip the port
  const colonCount = (cleaned.match(/:/g) || []).length;
  if (colonCount === 1) {
    cleaned = cleaned.split(":")[0];
  }

  return cleaned;
}

export const portCheckerInputSchema = z.object({
  target: z
    .string()
    .trim()
    .min(1, "Target host or IP address is required")
    .max(255)
    .transform(cleanHost)
    .refine((val) => val.length > 0, "Target cannot be empty"),
  port: z
    .number()
    .int()
    .refine(
      (val) => ALLOWED_PORT_NUMBERS.includes(val),
      `Port must be one of the permitted diagnostic ports: ${ALLOWED_PORT_NUMBERS.join(", ")}`,
    ),
});

export type ValidatedPortCheckerInput = z.infer<typeof portCheckerInputSchema>;
