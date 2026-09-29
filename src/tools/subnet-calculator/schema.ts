import { z } from "zod";

const ipv4Regex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export const subnetInputSchema = z.object({
  ip: z
    .string()
    .trim()
    .regex(ipv4Regex, "Must be a valid IPv4 address (e.g. 192.168.1.1)"),
  cidr: z
    .number()
    .int()
    .min(0, "CIDR prefix must be at least 0")
    .max(32, "CIDR prefix cannot exceed 32"),
});

export type ValidatedSubnetInput = z.infer<typeof subnetInputSchema>;
