import type { ValidatedPasswordGeneratorInput } from "./schema";
import type {
  PasswordGeneratorOutputData,
  GeneratedPasswordItem,
  PasswordStrengthTier,
} from "./types";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = "1lI0OosS52Z";

export interface CharPoolResult {
  pool: string;
  requiredCharsets: string[];
}

/**
 * Determines a human-readable strength classification based on Shannon entropy bits.
 */
export function getStrengthTier(entropyBits: number): PasswordStrengthTier {
  if (entropyBits >= 100) return "Uncrackable";
  if (entropyBits >= 80) return "Very Strong";
  if (entropyBits >= 60) return "Strong";
  if (entropyBits >= 40) return "Moderate";
  return "Weak";
}

/**
 * Provides an estimated brute-force crack time against modern high-performance GPU arrays.
 */
export function getCrackTimeEstimate(entropyBits: number): string {
  if (entropyBits >= 100) {
    return "Centuries to billions of years (exceeds age of the universe)";
  }
  if (entropyBits >= 80) {
    return "Millions of years against modern GPU cracking clusters";
  }
  if (entropyBits >= 60) {
    return "Hundreds to thousands of years against dedicated offline attacks";
  }
  if (entropyBits >= 40) {
    return "Several days to months against automated dictionary/GPU tools";
  }
  return "Instantly to a few hours with consumer graphics hardware";
}

/**
 * Builds the character pool based on selected options.
 */
export function buildCharacterPool(
  opts: ValidatedPasswordGeneratorInput,
): CharPoolResult {
  let pool = "";
  const requiredCharsets: string[] = [];

  const filterAmbiguous = (chars: string) => {
    if (!opts.excludeAmbiguous) return chars;
    return chars
      .split("")
      .filter((c) => !AMBIGUOUS.includes(c))
      .join("");
  };

  if (opts.includeUppercase) {
    const chars = filterAmbiguous(UPPERCASE);
    if (chars.length > 0) {
      pool += chars;
      requiredCharsets.push(chars);
    }
  }

  if (opts.includeLowercase) {
    const chars = filterAmbiguous(LOWERCASE);
    if (chars.length > 0) {
      pool += chars;
      requiredCharsets.push(chars);
    }
  }

  if (opts.includeNumbers) {
    const chars = filterAmbiguous(NUMBERS);
    if (chars.length > 0) {
      pool += chars;
      requiredCharsets.push(chars);
    }
  }

  if (opts.includeSymbols) {
    const chars = filterAmbiguous(SYMBOLS);
    if (chars.length > 0) {
      pool += chars;
      requiredCharsets.push(chars);
    }
  }

  return { pool, requiredCharsets };
}

/**
 * Pure compute function for Password Generator.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 * Accepts an optional random generator function for deterministic testing.
 */
export function computePasswords(
  input: ValidatedPasswordGeneratorInput,
  getRandomInt: (max: number) => number = (max) => {
    // Default CSPRNG random generator using crypto.getRandomValues
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      return buffer[0] % max;
    }
    // Fallback pseudo-random for headless environments
    return Math.floor(Math.random() * max);
  },
): PasswordGeneratorOutputData {
  const { pool, requiredCharsets } = buildCharacterPool(input);

  if (pool.length === 0) {
    throw new Error("Character pool is empty with current settings.");
  }

  const poolSize = pool.length;
  const entropyBits = Math.round(input.length * Math.log2(poolSize) * 10) / 10;
  const strengthTier = getStrengthTier(entropyBits);
  const crackTimeEstimate = getCrackTimeEstimate(entropyBits);

  const passwords: GeneratedPasswordItem[] = [];
  const quantity = input.quantity || 1;

  for (let q = 0; q < quantity; q++) {
    const chars: string[] = [];

    // 1. Guarantee at least one character from each selected set
    for (const set of requiredCharsets) {
      if (chars.length < input.length) {
        const randIdx = getRandomInt(set.length);
        chars.push(set[randIdx]);
      }
    }

    // 2. Fill the remainder of the length from the full pool
    while (chars.length < input.length) {
      const randIdx = getRandomInt(poolSize);
      chars.push(pool[randIdx]);
    }

    // 3. Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      const temp = chars[i];
      chars[i] = chars[j];
      chars[j] = temp;
    }

    passwords.push({
      password: chars.join(""),
      entropyBits,
      length: input.length,
      strengthTier,
      crackTimeEstimate,
    });
  }

  return {
    passwords,
    optionsUsed: input,
    characterPoolSize: poolSize,
    generatedAt: new Date().toISOString(),
  };
}
