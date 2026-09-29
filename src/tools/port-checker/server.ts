import "server-only";
import dns from "node:dns/promises";
import net from "node:net";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import { isIpBlocked } from "@/core/security/safe-fetch";
import { portCheckerInputSchema, type ValidatedPortCheckerInput } from "./schema";
import { computePortCheckerData } from "./compute";
import type { PortCheckerData, PortStatus } from "./types";

const serverModule: ToolServerModule<ValidatedPortCheckerInput, PortCheckerData> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<PortCheckerData>> {
    void _ctx;
    // 1. Validate target and allowlisted port
    const validated = portCheckerInputSchema.parse(rawInput);
    const { target, port } = validated;

    // 2. Resolve hostname and verify SSRF protection
    let resolvedIp = "";
    if (net.isIP(target)) {
      resolvedIp = target;
    } else {
      try {
        const lookup = await dns.lookup(target);
        resolvedIp = lookup.address;
      } catch {
        throw new Error(`Unable to resolve host '${target}'. Check the domain name.`);
      }
    }

    if (isIpBlocked(resolvedIp)) {
      throw new Error(`Target IP (${resolvedIp}) is private or blocked by security policy.`);
    }

    // 3. Perform TCP Handshake with timeout
    const start = performance.now();
    let status: PortStatus = "filtered";
    let latencyMs = 0;

    await new Promise<void>((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(3000);

      socket.on("connect", () => {
        status = "open";
        latencyMs = performance.now() - start;
        socket.destroy();
        resolve();
      });

      socket.on("timeout", () => {
        status = "filtered";
        latencyMs = performance.now() - start;
        socket.destroy();
        resolve();
      });

      socket.on("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "ECONNREFUSED") {
          status = "closed";
        } else {
          status = "filtered";
        }
        latencyMs = performance.now() - start;
        socket.destroy();
        resolve();
      });

      socket.connect(port, resolvedIp);
    });

    // 4. Delegate to pure compute function
    const data = computePortCheckerData(target, resolvedIp, port, status, latencyMs);

    // 5. Return standard ToolResult
    return {
      toolId: "port-checker",
      target: `${target}:${port}`,
      ranAt: new Date().toISOString(),
      data,
    };
  },
};

export default serverModule;
