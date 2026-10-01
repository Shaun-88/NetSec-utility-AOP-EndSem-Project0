import { z } from 'zod';

export const pwnedPasswordInputSchema = z.object({
  prefix: z.string().length(5).regex(/^[0-9a-f]{5}$/i, 'Must be 5 hex characters'),
  fullHash: z.string().length(40).regex(/^[0-9a-f]{40}$/i, 'Must be 40 hex characters'),
});

export type ValidatedPwnedPasswordInput = z.infer<typeof pwnedPasswordInputSchema>;
