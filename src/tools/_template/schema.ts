import { z } from "zod";

/**
 * Zod validation schema for the Template Tool input.
 * Every tool MUST validate its input via schema.ts before execution.
 */
export const templateInputSchema = z.object({
  target: z.string().trim().max(255).optional(),
  sampleOption: z.boolean().optional().default(false),
});

export type ValidatedTemplateInput = z.infer<typeof templateInputSchema>;
