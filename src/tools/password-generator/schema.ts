import { z } from "zod";

export const passwordGeneratorInputSchema = z
  .object({
    length: z
      .number()
      .int()
      .min(6, "Password length must be at least 6 characters")
      .max(128, "Password length cannot exceed 128 characters")
      .default(16),
    includeUppercase: z.boolean().default(true),
    includeLowercase: z.boolean().default(true),
    includeNumbers: z.boolean().default(true),
    includeSymbols: z.boolean().default(true),
    excludeAmbiguous: z.boolean().default(false),
    quantity: z.number().int().min(1).max(20).default(1),
  })
  .refine(
    (data) =>
      data.includeUppercase ||
      data.includeLowercase ||
      data.includeNumbers ||
      data.includeSymbols,
    "At least one character set (uppercase, lowercase, numbers, or symbols) must be selected.",
  );

export type ValidatedPasswordGeneratorInput = z.infer<
  typeof passwordGeneratorInputSchema
>;
