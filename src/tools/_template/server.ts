import "server-only";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import { templateInputSchema, type ValidatedTemplateInput } from "./schema";
import { computeTemplateOutput } from "./compute";
import type { TemplateOutputData } from "./types";

const serverModule: ToolServerModule<ValidatedTemplateInput, TemplateOutputData> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<TemplateOutputData>> {
    void _ctx;
    // 1. Validate input strictly against schema
    const validated = templateInputSchema.parse(rawInput);

    // 2. Perform any network/server operations here if needed (via safeFetch)
    // For template, we simulate server diagnostics calculation
    const calculatedScore = validated.target?.includes("secure") ? 95 : 75;

    // 3. Delegate output formulation to the pure compute function
    const data = computeTemplateOutput(validated, calculatedScore);

    // 4. Return standard ToolResult shape
    return {
      toolId: "template",
      target: validated.target,
      ranAt: new Date().toISOString(),
      data,
    };
  },
};

export default serverModule;
