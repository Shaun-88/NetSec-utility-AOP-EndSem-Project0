import { describe, it, expect } from "vitest";
import { computeTemplateOutput } from "./compute";
import { templateInputSchema } from "./schema";

describe("Template Tool Contract Tests", () => {
  it("validates input properly against schema", () => {
    const valid = templateInputSchema.parse({
      target: "example.com",
      sampleOption: true,
    });
    expect(valid.target).toBe("example.com");
    expect(valid.sampleOption).toBe(true);
  });

  it("handles empty / default schema inputs cleanly", () => {
    const valid = templateInputSchema.parse({});
    expect(valid.sampleOption).toBe(false);
    expect(valid.target).toBeUndefined();
  });

  it("computes pure output deterministically without I/O", () => {
    const result = computeTemplateOutput({ target: "test.local", sampleOption: false }, 85);
    expect(result.status).toBe("success");
    expect(result.computedScore).toBe(85);
    expect(result.processedTarget).toBe("test.local");
  });

  it("applies option boost in compute logic", () => {
    const result = computeTemplateOutput({ target: "test.local", sampleOption: true }, 75);
    expect(result.status).toBe("success");
    expect(result.computedScore).toBe(85); // 75 + 10 boost
  });
});
