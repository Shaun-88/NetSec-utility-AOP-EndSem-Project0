import { z } from "zod";

function sanitizeDomain(val: string): string {
  let cleaned = val.trim().toLowerCase();
  // Strip protocol prefix
  cleaned = cleaned.replace(/^https?:\/\//, "");
  // Strip path, query strings, and port
  cleaned = cleaned.split("/")[0].split("?")[0].split(":")[0];
  return cleaned;
}

const domainRegex =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

export const tlsCheckerInputSchema = z.object({
  target: z
    .string()
    .trim()
    .min(1, "Domain name is required")
    .max(255)
    .transform(sanitizeDomain)
    .refine(
      (val) => domainRegex.test(val),
      "Must be a valid domain name (e.g. example.com or cloudflare.com)",
    ),
});

export type ValidatedTlsCheckerInput = z.infer<typeof tlsCheckerInputSchema>;
