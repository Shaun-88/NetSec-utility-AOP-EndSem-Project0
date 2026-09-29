import { z } from "zod";

export const passwordStrengthInputSchema = z.object({
  password: z
    .string()
    .max(256, "Password evaluation capped at 256 characters")
    .default(""),
});

export type ValidatedPasswordStrengthInput = z.infer<
  typeof passwordStrengthInputSchema
>;
