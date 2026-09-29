import type { ValidatedBinaryTextInput } from "./schema";
import type { BinaryTextOutputData, BinaryDelimiter } from "./types";

function getDelimiterString(del: BinaryDelimiter = "space"): string {
  switch (del) {
    case "none":
      return "";
    case "comma":
      return ",";
    case "hyphen":
      return "-";
    case "space":
    default:
      return " ";
  }
}

/**
 * Converts a UTF-8 text string into 8-bit binary and hex bytecode.
 */
export function textToBinary(
  text: string,
  delimiter: BinaryDelimiter = "space",
): { binary: string; hex: string; byteCount: number } {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const sep = getDelimiterString(delimiter);

  const binaryChunks: string[] = [];
  const hexChunks: string[] = [];

  for (let i = 0; i < bytes.length; i++) {
    binaryChunks.push(bytes[i].toString(2).padStart(8, "0"));
    hexChunks.push(bytes[i].toString(16).padStart(2, "0").toUpperCase());
  }

  return {
    binary: binaryChunks.join(sep),
    hex: hexChunks.join(" "),
    byteCount: bytes.length,
  };
}

/**
 * Converts a binary string into decoded UTF-8 text.
 */
export function binaryToText(
  binaryInput: string,
): { text: string; byteCount: number; isValid: boolean; error?: string } {
  // Strip common delimiters (spaces, commas, hyphens)
  const cleaned = binaryInput.replace(/[\s,\-]+/g, "").trim();

  if (cleaned.length === 0) {
    return { text: "", byteCount: 0, isValid: true };
  }

  // Validate that input consists exclusively of 0 and 1
  if (!/^[01]+$/.test(cleaned)) {
    return {
      text: "",
      byteCount: 0,
      isValid: false,
      error: "Binary string contains invalid characters (only 0 and 1 are permitted).",
    };
  }

  // Check if length is a multiple of 8
  if (cleaned.length % 8 !== 0) {
    return {
      text: "",
      byteCount: 0,
      isValid: false,
      error: `Binary stream length (${cleaned.length} bits) is not a multiple of 8 bits. Incomplete byte detected.`,
    };
  }

  const byteCount = cleaned.length / 8;
  const byteArray = new Uint8Array(byteCount);

  for (let i = 0; i < byteCount; i++) {
    const chunk = cleaned.slice(i * 8, (i + 1) * 8);
    byteArray[i] = parseInt(chunk, 2);
  }

  try {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    const decodedText = decoder.decode(byteArray);
    return { text: decodedText, byteCount, isValid: true };
  } catch {
    // If UTF-8 fatal decoding fails, fallback to loose ISO-8859-1 string
    let loose = "";
    for (let i = 0; i < byteArray.length; i++) {
      loose += String.fromCharCode(byteArray[i]);
    }
    return {
      text: loose,
      byteCount,
      isValid: true,
      error: "Note: Encoded bytes are non-standard UTF-8; rendered as raw ASCII/Latin-1.",
    };
  }
}

/**
 * Pure compute function for Binary ⇄ Text Converter.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeBinaryText(
  input: ValidatedBinaryTextInput,
): BinaryTextOutputData {
  const { input: rawInput, mode, delimiter = "space" } = input;

  if (mode === "text-to-binary") {
    const { binary, hex, byteCount } = textToBinary(rawInput, delimiter);
    return {
      input: rawInput,
      output: binary,
      mode,
      charCount: rawInput.length,
      byteCount,
      bitCount: byteCount * 8,
      hexEquivalent: hex,
      isValid: true,
    };
  } else {
    const { text, byteCount, isValid, error } = binaryToText(rawInput);
    return {
      input: rawInput,
      output: text,
      mode,
      charCount: text.length,
      byteCount,
      bitCount: byteCount * 8,
      isValid,
      error,
    };
  }
}
