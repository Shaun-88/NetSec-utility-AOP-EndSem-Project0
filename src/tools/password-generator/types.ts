/**
 * Type contracts for the Password Generator Tool.
 */

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  quantity?: number;
}

export interface GeneratedPasswordItem {
  password: string;
  entropyBits: number;
  length: number;
}

export interface PasswordGeneratorOutputData {
  passwords: GeneratedPasswordItem[];
  optionsUsed: PasswordGeneratorOptions;
  characterPoolSize: number;
  generatedAt: string;
}
