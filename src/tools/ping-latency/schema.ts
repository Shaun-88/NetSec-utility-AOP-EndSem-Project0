import { z } from "zod";

function cleanTarget(val: string): string {
  let cleaned = val.trim();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

export const pingLatencyInputSchema = z.object({
  target: z
    .string()
    .trim()
    .min(1, "Target hostname or URL is required")
    .max(255)
    .transform(cleanTarget)
    .refine((val) => {
      try {
        const u = new URL(val);
        return u.hostname.length > 0;
      } catch {
        return false;
      }
    }, "Must be a valid hostname or web URL"),
  count: z
    .number()
    .int()
    .min(1, "Minimum 1 probe")
    .max(5, "Maximum 5 probes per test")
    .optional()
    .default(4),
});

export type ValidatedPingLatencyInput = z.infer<typeof pingLatencyInputSchema>;
