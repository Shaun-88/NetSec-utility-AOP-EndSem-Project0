import "server-only";
import dns from "node:dns/promises";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import { safeFetch, isIpBlocked } from "@/core/security/safe-fetch";
import { pingLatencyInputSchema, type ValidatedPingLatencyInput } from "./schema";
import { computePingLatencyData } from "./compute";
import type { PingLatencyData, PingProbeResult } from "./types";

const serverModule: ToolServerModule<ValidatedPingLatencyInput, PingLatencyData> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<PingLatencyData>> {
    void _ctx;
    // 1. Validate input strictly against schema
    const validated = pingLatencyInputSchema.parse(rawInput);
    const targetUrl = validated.target;
    const probeCount = validated.count;

    const parsedUrl = new URL(targetUrl);
    const hostname = parsedUrl.hostname;

    // 2. Pre-flight DNS & SSRF validation
    let resolvedIp: string | undefined;
    try {
      const lookup = await dns.lookup(hostname);
      resolvedIp = lookup.address;

      if (isIpBlocked(resolvedIp)) {
        throw new Error(`Target IP (${resolvedIp}) is private or blocked by security policy.`);
      }
    } catch (dnsErr) {
      if (dnsErr instanceof Error && dnsErr.message.includes("security policy")) {
        throw dnsErr;
      }
      throw new Error(`Unable to resolve target host '${hostname}'. Check the domain.`);
    }

    // 3. Execute sequential probes via safeFetch with inter-probe spacing
    const probes: PingProbeResult[] = [];

    for (let i = 1; i <= probeCount; i++) {
      if (i > 1) {
        // 100ms inter-probe interval mimics standard ICMP spacing and prevents burst throttling
        await new Promise((r) => setTimeout(r, 100));
      }

      const start = performance.now();
      try {
        const response = await safeFetch(targetUrl, {
          method: "HEAD",
          timeoutMs: 3500,
          headers: {
            "User-Agent": "NetSecArmoury-PingProbe/1.0",
            "Cache-Control": "no-cache",
          },
        });
        const durationMs = performance.now() - start;

        probes.push({
          seq: i,
          durationMs: Math.round(durationMs * 10) / 10,
          status: response.status,
          success: true,
        });
      } catch (err) {
        const durationMs = performance.now() - start;
        probes.push({
          seq: i,
          durationMs: Math.round(durationMs * 10) / 10,
          status: 0,
          success: false,
          error: err instanceof Error ? err.message : "Probe timeout",
        });
      }
    }

    // 4. Delegate to pure compute function
    const data = computePingLatencyData(targetUrl, probes, resolvedIp);

    // 5. Return standard ToolResult
    return {
      toolId: "ping-latency",
      target: targetUrl,
      ranAt: new Date().toISOString(),
      data,
    };
  },
};

export default serverModule;
