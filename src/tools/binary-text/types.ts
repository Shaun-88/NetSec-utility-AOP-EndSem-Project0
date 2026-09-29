/**
 * Type contracts for the Binary ⇄ Text Converter Tool.
 */

export type ConversionMode = "text-to-binary" | "binary-to-text";
export type BinaryDelimiter = "space" | "none" | "comma" | "hyphen";

export interface BinaryTextInput {
  input: string;
  mode: ConversionMode;
  delimiter?: BinaryDelimiter;
}

export interface BinaryTextOutputData {
  input: string;
  output: string;
  mode: ConversionMode;
  charCount: number;
  byteCount: number;
  bitCount: number;
  hexEquivalent?: string;
  isValid: boolean;
  error?: string;
}
