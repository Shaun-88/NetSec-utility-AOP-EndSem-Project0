import { z } from "zod";

export const hashGeneratorInputSchema = z.object({
  text: z.string().max(100000, "Text cannot exceed 100,000 characters"),
  hmacKey: z.string().max(1024).optional().default(""),
  uppercase: z.boolean().optional().default(false),
});

export type ValidatedHashGeneratorInput = z.infer<typeof hashGeneratorInputSchema>;
