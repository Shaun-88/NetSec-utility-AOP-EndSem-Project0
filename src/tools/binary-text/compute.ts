import type { ValidatedBinaryTextInput } from "./schema";
import type { BinaryTextOutputData, BinaryDelimiter, CharacterByteBreakdown } from "./types";

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
 * Converts a UTF-8 text string into 8-bit binary and hex bytecode,
 * and generates an educational character-by-character breakdown.
 */
export function textToBinary(
  text: string,
  delimiter: BinaryDelimiter = "space",
): {
  binary: string;
  hex: string;
  byteCount: number;
  charBreakdown: CharacterByteBreakdown[];
} {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const sep = getDelimiterString(delimiter);

  const binaryChunks: string[] = [];
  const hexChunks: string[] = [];

  for (let i = 0; i < bytes.length; i++) {
    binaryChunks.push(bytes[i].toString(2).padStart(8, "0"));
    hexChunks.push(bytes[i].toString(16).padStart(2, "0").toUpperCase());
  }

  // Educational character breakdown (capped at 32 characters for performance)
  const charBreakdown: CharacterByteBreakdown[] = [];
  const previewSlice = Array.from(text).slice(0, 32);
  for (const char of previewSlice) {
    const charBytes = encoder.encode(char);
    const binStr = Array.from(charBytes)
      .map((b) => b.toString(2).padStart(8, "0"))
      .join(" ");
    const hexStr = Array.from(charBytes)
      .map((b) => "0x" + b.toString(16).padStart(2, "0").toUpperCase())
      .join(" ");
    const code = char.codePointAt(0) || 0;

    charBreakdown.push({
      char: char === " " ? "[Space]" : char === "\n" ? "[Newline]" : char,
      asciiCode: code,
      hex: hexStr,
      binary: binStr,
    });
  }

  return {
    binary: binaryChunks.join(sep),
    hex: hexChunks.join(" "),
    byteCount: bytes.length,
    charBreakdown,
  };
}

/**
 * Converts a binary bit stream into decoded UTF-8 text,
 * validating bit lengths and character validity.
 */
export function binaryToText(
  binaryInput: string,
): {
  text: string;
  byteCount: number;
  charBreakdown?: CharacterByteBreakdown[];
  isValid: boolean;
  error?: string;
} {
  // Strip common delimiters (spaces, commas, hyphens)
  const cleaned = binaryInput.replace(/[\s,\-]+/g, "").trim();

  if (cleaned.length === 0) {
    return { text: "", byteCount: 0, isValid: true, charBreakdown: [] };
  }

  // Validate that input consists exclusively of 0 and 1
  if (!/^[01]+$/.test(cleaned)) {
    return {
      text: "",
      byteCount: 0,
      isValid: false,
      error: "Binary stream contains invalid characters (only 0 and 1 are permitted).",
    };
  }

  // Check if length is a multiple of 8
  if (cleaned.length % 8 !== 0) {
    const remainder = cleaned.length % 8;
    return {
      text: "",
      byteCount: 0,
      isValid: false,
      error: `Binary stream length (${cleaned.length} bits) is not a multiple of 8 bits. Incomplete byte detected (${remainder} bits leftover). A complete byte requires exactly 8 bits.`,
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

    const charBreakdown: CharacterByteBreakdown[] = [];
    const previewSlice = Array.from(decodedText).slice(0, 32);
    const encoder = new TextEncoder();
    for (const char of previewSlice) {
      const charBytes = encoder.encode(char);
      const binStr = Array.from(charBytes)
        .map((b) => b.toString(2).padStart(8, "0"))
        .join(" ");
      const hexStr = Array.from(charBytes)
        .map((b) => "0x" + b.toString(16).padStart(2, "0").toUpperCase())
        .join(" ");
      const code = char.codePointAt(0) || 0;

      charBreakdown.push({
        char: char === " " ? "[Space]" : char === "\n" ? "[Newline]" : char,
        asciiCode: code,
        hex: hexStr,
        binary: binStr,
      });
    }

    return { text: decodedText, byteCount, charBreakdown, isValid: true };
  } catch {
    // Fallback to Latin-1
    let loose = "";
    for (let i = 0; i < byteArray.length; i++) {
      loose += String.fromCharCode(byteArray[i]);
    }
    return {
      text: loose,
      byteCount,
      isValid: true,
      error: "Note: Encoded bytes are non-standard UTF-8; rendered as raw ASCII/Latin-1 characters.",
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
    const { binary, hex, byteCount, charBreakdown } = textToBinary(rawInput, delimiter);
    return {
      input: rawInput,
      output: binary,
      mode,
      charCount: rawInput.length,
      byteCount,
      bitCount: byteCount * 8,
      hexEquivalent: hex,
      charBreakdown,
      isValid: true,
    };
  } else {
    const { text, byteCount, charBreakdown, isValid, error } = binaryToText(rawInput);
    return {
      input: rawInput,
      output: text,
      mode,
      charCount: text.length,
      byteCount,
      bitCount: byteCount * 8,
      charBreakdown,
      isValid,
      error,
    };
  }
}
