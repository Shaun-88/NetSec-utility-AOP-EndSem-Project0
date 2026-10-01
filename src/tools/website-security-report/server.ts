import "server-only";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import { executeToolFrontDoor } from "@/core/tool-kit/runner";
import { saveToolHistory } from "@/db/queries/history";
import {
  websiteSecurityReportInputSchema,
  type ValidatedWebsiteSecurityReportInput,
} from "./schema";
import { computeSecurityReportGrade } from "./compute";
import type { WebsiteSecurityReportData } from "./types";

// CRITICAL ARCHITECTURE RULE: This server.ts MUST NOT import from any other tool folder.
// Sub-tools are invoked exclusively via executeToolFrontDoor (the canonical runner).
// This ensures zero coupling between tool modules.

const serverModule: ToolServerModule<
  ValidatedWebsiteSecurityReportInput,
  WebsiteSecurityReportData
> = {
  async run(
    rawInput: unknown,
    ctx: ToolRunContext,
  ): Promise<ToolResult<WebsiteSecurityReportData>> {
    const { userId } = ctx;

    // 1. Validate domain input
    const validated = websiteSecurityReportInputSchema.parse(rawInput);
    const domain = validated.target;

    // 2. Run all four sub-tools in parallel via executeToolFrontDoor
    // Note: executeToolFrontDoor already calls saveToolHistory for each sub-tool.
    // We do NOT call saveToolHistory again for the sub-results.
    const [dnsResult, headersResult, tlsResult, whoisResult] =
      await Promise.allSettled([
        executeToolFrontDoor({
          toolId: "dns-lookup",
          userId,
          body: { target: domain },
        }),
        executeToolFrontDoor({
          toolId: "security-headers",
          userId,
          body: { target: `https://${domain}` },
        }),
        executeToolFrontDoor({
          toolId: "tls-checker",
          userId,
          body: { target: domain },
        }),
        executeToolFrontDoor({
          toolId: "whois",
          userId,
          body: { target: domain },
        }),
      ]);

    // 3. Compute composite grade from sub-results
    const data = computeSecurityReportGrade(
      domain,
      dnsResult,
      headersResult,
      tlsResult,
      whoisResult,
    );

    // 4. Save composite report entry (once, for the aggregate result)
    await saveToolHistory(userId, "website-security-report", data, domain);

    // 5. Return ToolResult
    return {
      toolId: "website-security-report",
      target: domain,
      ranAt: data.ranAt,
      data,
    };
  },
};

export default serverModule;
