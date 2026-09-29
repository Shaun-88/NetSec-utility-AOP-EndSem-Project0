import { z } from "zod";

export const jwtDecoderInputSchema = z.object({
  token: z
    .string()
    .trim()
    .max(16384, "JWT string cannot exceed 16,384 characters"),
});

export type ValidatedJwtDecoderInput = z.infer<typeof jwtDecoderInputSchema>;
