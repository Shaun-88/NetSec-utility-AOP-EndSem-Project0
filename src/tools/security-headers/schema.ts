import { z } from "zod";

function cleanUrl(val: string): string {
  let cleaned = val.trim();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

export const securityHeadersInputSchema = z.object({
  target: z
    .string()
    .trim()
    .min(1, "Website hostname or URL is required")
    .max(255)
    .transform(cleanUrl)
    .refine((val) => {
      try {
        const u = new URL(val);
        return u.hostname.length > 0;
      } catch {
        return false;
      }
    }, "Must be a valid web domain or URL"),
});

export type ValidatedSecurityHeadersInput = z.infer<
  typeof securityHeadersInputSchema
>;
