import type { ValidatedPasswordStrengthInput } from "./schema";
import type {
  PasswordStrengthData,
  StrengthRating,
  CrackTimeEstimates,
  PasswordChecklist,
} from "./types";

const COMMON_PATTERNS = [
  "password",
  "123456",
  "12345678",
  "qwerty",
  "admin",
  "welcome",
  "login",
  "iloveyou",
  "letmein",
  "monkey",
  "dragon",
  "football",
];

const SEQUENTIAL_RUNS = [
  "01234567890",
  "abcdefghijklmnopqrstuvwxyz",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
];

/**
 * Converts seconds into a human-readable duration string.
 */
function formatCrackTime(seconds: number): string {
  if (seconds < 1) return "Instantaneous";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 10000) return `${Math.round(seconds / (31536000 * 100))} centuries`;
  if (seconds < 31536000 * 1e9) return `${Math.round(seconds / (31536000 * 1000))} millennia`;
  return "Trillions of years";
}

/**
 * Pure compute function for Password Strength Checker.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computePasswordStrength(
  input: ValidatedPasswordStrengthInput,
): PasswordStrengthData {
  const pwd = input.password || "";
  const length = pwd.length;

  if (length === 0) {
    return {
      length: 0,
      entropyBits: 0,
      characterPoolSize: 0,
      rating: "Very Weak",
      score: 0,
      checklist: {
        hasUppercase: false,
        hasLowercase: false,
        hasNumbers: false,
        hasSymbols: false,
        hasMinLength: false,
        hasNoCommonPatterns: true,
      },
      crackTimes: {
        onlineAttack: "Instantaneous",
        offlineFastHash: "Instantaneous",
        nationStateSupercomputer: "Instantaneous",
      },
      feedback: ["Enter a password to begin analysis."],
      warnings: [],
    };
  }

  // 1. Character set detection
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumbers = /[0-9]/.test(pwd);
  const hasSymbols = /[^A-Za-z0-9]/.test(pwd);
  const hasMinLength = length >= 12;

  let poolSize = 0;
  if (hasUppercase) poolSize += 26;
  if (hasLowercase) poolSize += 26;
  if (hasNumbers) poolSize += 10;
  if (hasSymbols) poolSize += 33;
  if (poolSize === 0) poolSize = 1;

  // 2. Entropy calculation
  const rawEntropy = length * Math.log2(poolSize);

  // 3. Pattern Heuristic Checks
  const warnings: string[] = [];
  const lowerPwd = pwd.toLowerCase();
  let penalty = 0;

  for (const common of COMMON_PATTERNS) {
    if (lowerPwd.includes(common)) {
      warnings.push(`Contains common dictionary term: '${common}'`);
      penalty += 20;
      break;
    }
  }

  // Check repeating characters (e.g. "aaa", "111")
  if (/(.)\1{2,}/.test(pwd)) {
    warnings.push("Contains consecutive repeating characters.");
    penalty += 10;
  }

  // Check sequential sequences
  for (const seq of SEQUENTIAL_RUNS) {
    for (let i = 0; i <= seq.length - 3; i++) {
      const sub = seq.slice(i, i + 3);
      if (lowerPwd.includes(sub)) {
        warnings.push(`Contains predictable sequence: '${sub}'`);
        penalty += 10;
        break;
      }
    }
  }

  const effectiveEntropy = Math.max(0, Math.round((rawEntropy - penalty) * 10) / 10);

  // 4. Score (0 - 100)
  let score = Math.min(100, Math.round((effectiveEntropy / 80) * 100));
  if (length < 8) score = Math.min(score, 15);
  // Any known dictionary term severely compromises the password
  if (warnings.some((w) => w.includes("dictionary term"))) {
    score = Math.min(score, 15);
  }

  // 5. Rating classification
  let rating: StrengthRating = "Very Weak";
  if (score >= 80) rating = "Very Strong";
  else if (score >= 60) rating = "Strong";
  else if (score >= 40) rating = "Moderate";
  else if (score >= 20) rating = "Weak";

  // 6. Crack Time Calculation
  const totalCombinations = Math.pow(poolSize, length);
  const onlineSec = totalCombinations / (100 * 2); // 100 guesses/sec (avg 50% search)
  const offlineSec = totalCombinations / (10_000_000_000 * 2); // 10B guesses/sec (GPU cluster)
  const superSec = totalCombinations / (10_000_000_000_000 * 2); // 10T guesses/sec (Supercomputer)

  const crackTimes: CrackTimeEstimates = {
    onlineAttack: formatCrackTime(onlineSec),
    offlineFastHash: formatCrackTime(offlineSec),
    nationStateSupercomputer: formatCrackTime(superSec),
  };

  // 7. Actionable Feedback
  const feedback: string[] = [];
  if (length < 12) feedback.push("Increase length to at least 12–16 characters for robust resistance.");
  if (!hasUppercase) feedback.push("Add uppercase letters (A–Z) to expand character space.");
  if (!hasNumbers) feedback.push("Add numeric digits (0–9).");
  if (!hasSymbols) feedback.push("Add special symbols (!@#$%^&*) to maximize entropy.");
  if (feedback.length === 0 && warnings.length === 0) {
    feedback.push("Excellent entropy and character distribution. Strong defense profile.");
  }

  const checklist: PasswordChecklist = {
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    hasMinLength,
    hasNoCommonPatterns: warnings.length === 0,
  };

  return {
    length,
    entropyBits: effectiveEntropy,
    characterPoolSize: poolSize,
    rating,
    score,
    checklist,
    crackTimes,
    feedback,
    warnings,
  };
}
