import { z } from "zod";

function sanitizeDomain(val: string): string {
  let cleaned = val.trim().toLowerCase();
  // Strip http:// or https:// if provided
  cleaned = cleaned.replace(/^https?:\/\//, "");
  // Strip path or query strings
  cleaned = cleaned.split("/")[0].split("?")[0].split(":")[0];
  return cleaned;
}

const domainRegex =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

export const dnsLookupInputSchema = z.object({
  target: z
    .string()
    .trim()
    .min(1, "Domain name is required")
    .transform(sanitizeDomain)
    .refine(
      (val) => domainRegex.test(val) || val === "localhost",
      "Must be a valid domain name (e.g. example.com or cloudflare.com)",
    ),
  recordType: z
    .enum(["ALL", "A", "AAAA", "MX", "TXT", "NS", "CNAME", "SOA"])
    .optional()
    .default("ALL"),
});

export type ValidatedDnsLookupInput = z.infer<typeof dnsLookupInputSchema>;
