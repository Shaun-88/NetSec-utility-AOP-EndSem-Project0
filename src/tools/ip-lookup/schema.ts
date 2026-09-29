import { z } from "zod";

export const ipLookupInputSchema = z.object({
  target: z
    .string()
    .trim()
    .max(255, "Target must be 255 characters or fewer")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
});

export type ValidatedIpLookupInput = z.infer<typeof ipLookupInputSchema>;
