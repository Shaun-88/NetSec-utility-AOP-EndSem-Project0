import "server-only";
import dns from "node:dns/promises";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import { dnsLookupInputSchema, type ValidatedDnsLookupInput } from "./schema";
import { computeDnsLookupData, type RawDnsCollection } from "./compute";
import type { DnsLookupData } from "./types";

const serverModule: ToolServerModule<ValidatedDnsLookupInput, DnsLookupData> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<DnsLookupData>> {
    void _ctx;
    // 1. Validate domain input
    const validated = dnsLookupInputSchema.parse(rawInput);
    const domain = validated.target;
    const requestedType = validated.recordType || "ALL";

    const rawCollection: RawDnsCollection = {};

    // Helper to run query safely without throwing on ENODATA / ENOTFOUND
    const safeResolve = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await fn();
      } catch {
        return undefined;
      }
    };

    const tasks: Promise<void>[] = [];

    if (requestedType === "ALL" || requestedType === "A") {
      tasks.push(
        safeResolve(() => dns.resolve4(domain, { ttl: true })).then((res) => {
          if (res) rawCollection.a = res;
        }),
      );
    }

    if (requestedType === "ALL" || requestedType === "AAAA") {
      tasks.push(
        safeResolve(() => dns.resolve6(domain, { ttl: true })).then((res) => {
          if (res) rawCollection.aaaa = res;
        }),
      );
    }

    if (requestedType === "ALL" || requestedType === "MX") {
      tasks.push(
        safeResolve(() => dns.resolveMx(domain)).then((res) => {
          if (res) rawCollection.mx = res;
        }),
      );
    }

    if (requestedType === "ALL" || requestedType === "TXT") {
      tasks.push(
        safeResolve(() => dns.resolveTxt(domain)).then((res) => {
          if (res) rawCollection.txt = res;
        }),
      );
    }

    if (requestedType === "ALL" || requestedType === "NS") {
      tasks.push(
        safeResolve(() => dns.resolveNs(domain)).then((res) => {
          if (res) rawCollection.ns = res;
        }),
      );
    }

    if (requestedType === "ALL" || requestedType === "CNAME") {
      tasks.push(
        safeResolve(() => dns.resolveCname(domain)).then((res) => {
          if (res) rawCollection.cname = res;
        }),
      );
    }

    if (requestedType === "ALL" || requestedType === "SOA") {
      tasks.push(
        safeResolve(() => dns.resolveSoa(domain)).then((res) => {
          if (res) rawCollection.soa = res;
        }),
      );
    }

    await Promise.all(tasks);

    // 2. Delegate to pure compute function
    const data = computeDnsLookupData(domain, rawCollection);

    if (data.totalRecordsFound === 0) {
      // Check if domain actually exists
      try {
        await dns.lookup(domain);
      } catch {
        throw new Error(`Domain '${domain}' could not be resolved. Verify domain name.`);
      }
    }

    // 3. Return ToolResult
    return {
      toolId: "dns-lookup",
      target: domain,
      ranAt: new Date().toISOString(),
      data,
    };
  },
};

export default serverModule;
