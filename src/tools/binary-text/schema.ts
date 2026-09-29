import { z } from "zod";

export const binaryTextInputSchema = z.object({
  input: z.string().max(50000, "Input text cannot exceed 50,000 characters"),
  mode: z.enum(["text-to-binary", "binary-to-text"]).default("text-to-binary"),
  delimiter: z.enum(["space", "none", "comma", "hyphen"]).optional().default("space"),
});

export type ValidatedBinaryTextInput = z.infer<typeof binaryTextInputSchema>;
