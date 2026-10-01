import { z } from "zod";

export const breachCheckerInputSchema = z.object({
  target: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Must be a valid email address"),
});

export type ValidatedBreachCheckerInput = z.infer<typeof breachCheckerInputSchema>;
