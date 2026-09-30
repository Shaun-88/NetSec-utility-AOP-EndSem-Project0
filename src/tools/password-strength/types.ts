/**
 * Type contracts for the Password Strength Checker Tool.
 */

export interface PasswordStrengthInput {
  password: string;
}

export type StrengthRating = "Very Weak" | "Weak" | "Moderate" | "Strong" | "Very Strong";

export interface CrackTimeEstimates {
  onlineAttack: string;         // ~100 guesses/sec (web login with rate limits)
  offlineFastHash: string;      // ~10 billion guesses/sec (GPU rig)
  nationStateSupercomputer: string; // ~10 trillion guesses/sec
}

export interface PasswordChecklist {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  hasMinLength: boolean;
  hasNoCommonPatterns: boolean;
}

export interface PasswordStrengthData {
  length: number;
  entropyBits: number;
  characterPoolSize: number;
  rating: StrengthRating;
  ratingDescription: string;
  score: number; // 0 to 100
  checklist: PasswordChecklist;
  crackTimes: CrackTimeEstimates;
  feedback: string[];
  warnings: string[];
  actionableTips: string[];
}
