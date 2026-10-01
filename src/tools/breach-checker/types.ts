/**
 * Type contracts for the Breach Checker Tool.
 */

export interface BreachEntry {
  name: string;
  domain?: string;
  breachDate?: string;
  description?: string;
  dataClasses: string[];
  isVerified?: boolean;
  isSensitive?: boolean;
  pwnCount?: number;
  logo?: string;
  hasPassword?: boolean;
}

export interface BreachCheckerOutputData {
  email: string;
  breachCount: number;
  isClean: boolean;
  breaches: BreachEntry[];
  checkedAt: string;
  provider?: string;
}

export interface BreachCheckerInput {
  target: string; // validated email
}
