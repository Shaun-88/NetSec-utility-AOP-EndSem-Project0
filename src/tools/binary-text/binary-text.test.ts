import { describe, it, expect } from "vitest";
import { textToBinary, binaryToText, computeBinaryText } from "./compute";
import { binaryTextInputSchema } from "./schema";

describe("Binary ⇄ Text Converter Contract Tests", () => {
  it("validates input schema defaults", () => {
    const valid = binaryTextInputSchema.parse({ input: "Test" });
    expect(valid.input).toBe("Test");
    expect(valid.mode).toBe("text-to-binary");
    expect(valid.delimiter).toBe("space");
  });

  it("converts ASCII text to binary accurately", () => {
    // 'A' is 65 -> 01000001
    const res = textToBinary("A", "none");
    expect(res.binary).toBe("01000001");
    expect(res.byteCount).toBe(1);
    expect(res.hex).toBe("41");
  });

  it("converts text to binary with delimiters", () => {
    const resSpace = textToBinary("Hi", "space");
    expect(resSpace.binary).toBe("01001000 01101001");

    const resComma = textToBinary("Hi", "comma");
    expect(resComma.binary).toBe("01001000,01101001");
  });

  it("decodes binary bytecode back to UTF-8 text accurately", () => {
    const res = binaryToText("01001000 01101001");
    expect(res.text).toBe("Hi");
    expect(res.isValid).toBe(true);
    expect(res.byteCount).toBe(2);
  });

  it("detects invalid binary characters and incomplete byte chunks", () => {
    const resInvalid = binaryToText("01001002");
    expect(resInvalid.isValid).toBe(false);
    expect(resInvalid.error).toContain("only 0 and 1");

    const resIncomplete = binaryToText("01001");
    expect(resIncomplete.isValid).toBe(false);
    expect(resIncomplete.error).toContain("not a multiple of 8 bits");
  });

  it("purely computes bidirectional transformations without I/O", () => {
    const toBinary = computeBinaryText({
      input: "Antigravity",
      mode: "text-to-binary",
      delimiter: "space",
    });
    expect(toBinary.isValid).toBe(true);
    expect(toBinary.byteCount).toBe(11);

    const backToText = computeBinaryText({
      input: toBinary.output,
      mode: "binary-to-text",
      delimiter: "space",
    });
    expect(backToText.output).toBe("Antigravity");
    expect(backToText.isValid).toBe(true);
  });
});
