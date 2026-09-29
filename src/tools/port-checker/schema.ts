import { z } from "zod";
import type { AllowedPortDefinition } from "./types";

export const ALLOWED_PORTS: AllowedPortDefinition[] = [
  { port: 21, service: "FTP", category: "Infrastructure", description: "File Transfer Protocol" },
  { port: 22, service: "SSH", category: "Remote Access", description: "Secure Shell Remote Administration" },
  { port: 25, service: "SMTP", category: "Mail", description: "Simple Mail Transfer Protocol" },
  { port: 53, service: "DNS", category: "Infrastructure", description: "Domain Name System" },
  { port: 80, service: "HTTP", category: "Web", description: "Standard Web Server" },
  { port: 110, service: "POP3", category: "Mail", description: "Post Office Protocol v3" },
  { port: 143, service: "IMAP", category: "Mail", description: "Internet Message Access Protocol" },
  { port: 443, service: "HTTPS", category: "Web", description: "Encrypted Web Server (TLS/SSL)" },
  { port: 465, service: "SMTPS", category: "Mail", description: "Encrypted Mail Submission" },
  { port: 587, service: "Submission", category: "Mail", description: "Authenticated SMTP Relaying" },
  { port: 993, service: "IMAPS", category: "Mail", description: "Encrypted IMAP" },
  { port: 995, service: "POP3S", category: "Mail", description: "Encrypted POP3" },
  { port: 3306, service: "MySQL", category: "Database", description: "MySQL Database Server" },
  { port: 5432, service: "PostgreSQL", category: "Database", description: "PostgreSQL Database Server" },
  { port: 8080, service: "HTTP-Alt", category: "Web", description: "Alternate Web / Proxy Port" },
  { port: 8443, service: "HTTPS-Alt", category: "Web", description: "Alternate Secure Web Port" },
];

export const ALLOWED_PORT_NUMBERS = ALLOWED_PORTS.map((p) => p.port);

function cleanHost(val: string): string {
  let cleaned = val.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, "");
  cleaned = cleaned.split("/")[0].split("?")[0].split(":")[0];
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
