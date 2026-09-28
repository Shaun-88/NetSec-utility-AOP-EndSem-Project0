import type { ValidatedTemplateInput } from "./schema";
import type { TemplateOutputData } from "./types";

/**
 * Pure compute function for Template Tool.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeTemplateOutput(
  input: ValidatedTemplateInput,
  rawCalculatedScore: number = 100,
): TemplateOutputData {
  const target = input.target || "default-target";
  const processedTarget = target.toLowerCase().trim();

  const adjustedScore = input.sampleOption
    ? Math.min(100, rawCalculatedScore + 10)
    : rawCalculatedScore;

  return {
    status: adjustedScore >= 80 ? "success" : "warning",
    processedTarget,
    computedScore: adjustedScore,
    details: {
      message: `Diagnostic evaluation computed for '${processedTarget}'.`,
      timestamp: new Date().toISOString(),
    },
  };
}
