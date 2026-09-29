import { z } from "zod";

export const internetSpeedInputSchema = z.object({
  target: z.string().trim().max(255).optional(),
  testSizeMb: z.number().int().min(1).max(20).optional().default(5),
});

export type ValidatedInternetSpeedInput = z.infer<typeof internetSpeedInputSchema>;
