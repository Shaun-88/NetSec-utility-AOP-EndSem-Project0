import "server-only";
import dns from "node:dns/promises";
import net from "node:net";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import { safeFetch, isIpBlocked } from "@/core/security/safe-fetch";
import { ipLookupInputSchema, type ValidatedIpLookupInput } from "./schema";
import { computeIpLookupData } from "./compute";
import type { IpLookupData, RawIpIntelligenceResponse } from "./types";

const serverModule: ToolServerModule<ValidatedIpLookupInput, IpLookupData> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<IpLookupData>> {
    void _ctx;
    // 1. Validate input strictly against schema
    const validated = ipLookupInputSchema.parse(rawInput);
    const targetQuery = validated.target?.trim();

    let targetIp = "";
    let resolvedHostname: string | undefined;

    if (targetQuery) {
      if (net.isIP(targetQuery)) {
        // Direct IP supplied
        targetIp = targetQuery;
        if (isIpBlocked(targetIp)) {
          throw new Error("Target IP address is reserved or blocked by security policy.");
        }
      } else {
        // Hostname supplied: resolve first
        try {
          const lookup = await dns.lookup(targetQuery);
          targetIp = lookup.address;
          resolvedHostname = targetQuery;

          if (isIpBlocked(targetIp)) {
            throw new Error(`Resolved IP (${targetIp}) is reserved or blocked by security policy.`);
          }
        } catch (dnsErr) {
          if (dnsErr instanceof Error && dnsErr.message.includes("security policy")) {
            throw dnsErr;
          }
          throw new Error(`Unable to resolve hostname '${targetQuery}'. Check the domain spelling.`);
        }
      }
    }

    // 2. Fetch IP intelligence data via safeFetch
    const endpoint = targetIp
      ? `https://ipwho.is/${encodeURIComponent(targetIp)}`
      : "https://ipwho.is/";

    const response = await safeFetch(endpoint, {
      timeoutMs: 6000,
    });

    if (response.status !== 200) {
      throw new Error(`IP intelligence provider returned HTTP ${response.status}.`);
    }

    const rawData = await response.json<RawIpIntelligenceResponse>();

    if (rawData.success === false) {
      throw new Error(rawData.message || "Failed to resolve IP intelligence records.");
    }

    // 3. Delegate output to pure compute function
    const data = computeIpLookupData(targetQuery || rawData.ip, rawData, resolvedHostname);

    // 4. Return standard ToolResult shape
    return {
      toolId: "ip-lookup",
      target: targetQuery || rawData.ip,
      ranAt: new Date().toISOString(),
      data,
    };
  },
};

export default serverModule;
