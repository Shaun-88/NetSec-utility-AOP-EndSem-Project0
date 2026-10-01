import "server-only";
import tls from "node:tls";
import dns from "node:dns/promises";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import { isIpBlocked } from "@/core/security/safe-fetch";
import { tlsCheckerInputSchema, type ValidatedTlsCheckerInput } from "./schema";
import { computeTlsData, type RawCertData } from "./compute";
import type { TlsCheckerOutputData } from "./types";

const serverModule: ToolServerModule<
  ValidatedTlsCheckerInput,
  TlsCheckerOutputData
> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<TlsCheckerOutputData>> {
    void _ctx;

    // 1. Validate domain input
    const validated = tlsCheckerInputSchema.parse(rawInput);
    const domain = validated.target;

    // 2. Resolve hostname to IP and check with isIpBlocked (SSRF protection)
    let resolvedIp: string;
    try {
      const lookup = await dns.lookup(domain);
      resolvedIp = lookup.address;
    } catch {
      throw new Error(
        `Unable to resolve host '${domain}'. Check the domain name.`,
      );
    }

    if (isIpBlocked(resolvedIp)) {
      throw new Error(
        `Target IP (${resolvedIp}) is private or blocked by security policy.`,
      );
    }

    // 3. Establish TLS connection and read certificate
    // NOTE: We use node:tls directly (not safeFetch) because we need raw certificate
    // access via getPeerCertificate(). isIpBlocked is used above for SSRF protection.
    const certData = await new Promise<{ cert: RawCertData; protocol: string }>(
      (resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("TLS connection timed out after 6 seconds.")),
          6000,
        );

        const socket = tls.connect(
          { host: domain, port: 443, servername: domain, rejectUnauthorized: false },
          () => {
            clearTimeout(timeout);

            const cert = socket.getPeerCertificate();
            const protocol = socket.getProtocol() ?? "Unknown";

            if (!cert || Object.keys(cert).length === 0) {
              socket.destroy();
              reject(new Error("No TLS certificate received from server."));
              return;
            }

            // Node's PeerCertificate has CN typed as string | string[] — normalize to string
            const subjectCN = Array.isArray(cert.subject?.CN)
              ? cert.subject.CN[0]
              : cert.subject?.CN;
            const subjectO = Array.isArray(cert.subject?.O)
              ? cert.subject.O[0]
              : cert.subject?.O;
            const issuerCN = Array.isArray(cert.issuer?.CN)
              ? cert.issuer.CN[0]
              : cert.issuer?.CN;
            const issuerO = Array.isArray(cert.issuer?.O)
              ? cert.issuer.O[0]
              : cert.issuer?.O;

            const rawCert: RawCertData = {
              subject: { CN: subjectCN, O: subjectO },
              issuer: { CN: issuerCN, O: issuerO },
              valid_from: cert.valid_from ?? "",
              valid_to: cert.valid_to ?? "",
              serialNumber: cert.serialNumber ?? "",
            };

            socket.destroy();
            resolve({ cert: rawCert, protocol });
          },
        );

        socket.on("error", (err) => {
          clearTimeout(timeout);
          reject(
            new Error(
              `TLS connection failed: ${err instanceof Error ? err.message : String(err)}`,
            ),
          );
        });
      },
    );

    // 4. Delegate to pure compute function
    const data = computeTlsData(domain, certData.cert, certData.protocol);

    // 5. Return ToolResult
    return {
      toolId: "tls-checker",
      target: domain,
      ranAt: new Date().toISOString(),
      data,
    };
  },
};

export default serverModule;
