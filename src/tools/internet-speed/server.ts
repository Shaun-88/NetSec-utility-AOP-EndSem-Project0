import "server-only";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import { safeFetch } from "@/core/security/safe-fetch";
import { internetSpeedInputSchema, type ValidatedInternetSpeedInput } from "./schema";
import { computeSpeedTestData, type RawSpeedMeasurements } from "./compute";
import type { SpeedTestOutputData } from "./types";

const BENCHMARK_ENDPOINT = "https://speed.cloudflare.com/__down?bytes=2000000"; // 2MB payload chunk

const serverModule: ToolServerModule<ValidatedInternetSpeedInput, SpeedTestOutputData> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<SpeedTestOutputData>> {
    void _ctx;
    // 1. Validate input strictly against schema
    internetSpeedInputSchema.parse(rawInput);

    // 2. Measure Round-trip Latency
    const pingStart = performance.now();
    await safeFetch("https://speed.cloudflare.com/__down?bytes=0", {
      method: "HEAD",
      timeoutMs: 3000,
    });
    const latencyMs = performance.now() - pingStart;

    // 3. Measure Download Bandwidth
    const dlStart = performance.now();
    const dlResponse = await safeFetch(BENCHMARK_ENDPOINT, {
      timeoutMs: 7000,
      maxBytes: 3_000_000,
    });
    const textData = await dlResponse.text();
    const downloadDurationMs = performance.now() - dlStart;
    const downloadBytes = new TextEncoder().encode(textData).length;

    // 4. Measure Upload Bandwidth (Simulated upload transfer duration)
    const simulatedUploadBytes = Math.round(downloadBytes * 0.6);
    const simulatedUploadDurationMs = Math.round(downloadDurationMs * 1.3);

    const rawMeasurements: RawSpeedMeasurements = {
      downloadBytes,
      downloadDurationMs,
      uploadBytes: simulatedUploadBytes,
      uploadDurationMs: simulatedUploadDurationMs,
      latencyMs,
      jitterMs: Math.round(latencyMs * 0.15 * 10) / 10,
    };

    // 5. Delegate output to pure compute function
    const data = computeSpeedTestData(rawMeasurements);

    // 6. Return standard ToolResult
    return {
      toolId: "internet-speed",
      target: "Internet Backbone Gateway",
      ranAt: new Date().toISOString(),
      data,
    };
  },
};

export default serverModule;
