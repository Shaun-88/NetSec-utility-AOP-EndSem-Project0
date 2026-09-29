import "server-only";
import dns from "node:dns/promises";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import { safeFetch, isIpBlocked } from "@/core/security/safe-fetch";
import {
  securityHeadersInputSchema,
  type ValidatedSecurityHeadersInput,
} from "./schema";
import { computeSecurityHeaderAudit } from "./compute";
import type { SecurityHeadersOutputData } from "./types";

const serverModule: ToolServerModule<
  ValidatedSecurityHeadersInput,
  SecurityHeadersOutputData
> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<SecurityHeadersOutputData>> {
    void _ctx;
    // 1. Validate target URL input
    const validated = securityHeadersInputSchema.parse(rawInput);
    const targetUrl = validated.target;

    const parsedUrl = new URL(targetUrl);
    const hostname = parsedUrl.hostname;

    // 2. Pre-flight DNS & SSRF validation
    try {
      const lookup = await dns.lookup(hostname);
      if (isIpBlocked(lookup.address)) {
        throw new Error(
          `Target IP address (${lookup.address}) is private or blocked by security policy.`,
        );
      }
    } catch (dnsErr) {
      if (dnsErr instanceof Error && dnsErr.message.includes("security policy")) {
        throw dnsErr;
      }
      throw new Error(`Unable to resolve target host '${hostname}'. Check the domain.`);
    }

    // 3. Fetch response headers via safeFetch
    const response = await safeFetch(targetUrl, {
      method: "GET",
      timeoutMs: 6000,
      maxRedirects: 4,
    });

    // 4. Extract raw headers
    const rawHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      rawHeaders[key] = val;
    });

    // 5. Delegate to pure compute function
    const data = computeSecurityHeaderAudit(
      targetUrl,
      rawHeaders,
      response.status,
      response.url,
    );

    // 6. Return ToolResult
    return {
      toolId: "security-headers",
      target: targetUrl,
      ranAt: new Date().toISOString(),
      data,
    };
  },
};

export default serverModule;
