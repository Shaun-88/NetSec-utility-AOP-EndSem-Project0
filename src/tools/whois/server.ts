import "server-only";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import { safeFetch } from "@/core/security/safe-fetch";
import { whoisInputSchema, type ValidatedWhoisInput } from "./schema";
import { computeWhoisData, type RawRdapResponse } from "./compute";
import type { WhoisOutputData } from "./types";

const serverModule: ToolServerModule<ValidatedWhoisInput, WhoisOutputData> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<WhoisOutputData>> {
    void _ctx;

    // 1. Validate domain input
    const validated = whoisInputSchema.parse(rawInput);
    const domain = validated.target;

    // 2. Fetch RDAP data via safeFetch (SSRF-hardened)
    // rdap.org bootstraps to the correct IANA registry for the TLD
    const rdapUrl = `https://rdap.org/domain/${domain}`;

    const response = await safeFetch(rdapUrl, {
      method: "GET",
      timeoutMs: 8000,
      maxRedirects: 4,
    });

    if (response.status === 404) {
      throw new Error(
        `Domain '${domain}' was not found in any RDAP registry. It may be unregistered.`,
      );
    }

    if (!response.status.toString().startsWith("2")) {
      throw new Error(
        `RDAP lookup failed with status ${response.status} for domain '${domain}'.`,
      );
    }

    const rdapData = await response.json<RawRdapResponse>();

    // 3. Delegate to pure compute function
    const data = computeWhoisData(domain, rdapData);

    // 4. Return ToolResult
    return {
      toolId: "whois",
      target: domain,
      ranAt: new Date().toISOString(),
      data,
    };
  },
};

export default serverModule;
