/**
 * Type contracts for the Template Tool.
 * Follow this pattern when creating new tools under src/tools/<id>/
 */

export interface TemplateInput {
  target?: string;
  sampleOption?: boolean;
}

export interface TemplateOutputData {
  status: "success" | "warning" | "error";
  processedTarget: string;
  computedScore: number;
  details: {
    message: string;
    timestamp: string;
  };
}
