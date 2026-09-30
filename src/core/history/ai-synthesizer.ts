/**
 * AI Context Synthesizer
 * Produces structured, concise telemetry and risk summaries for LLM consumption in the AI Zone.
 * Kept in tool_history.data.aiContext so the AI can ingest user history without parsing raw UIs.
 */

export interface ToolHistoryAIContext {
  summary: string;
  riskLevel: "none" | "low" | "medium" | "high" | "informational";
  keyFindings: string[];
  targetType: "hostname" | "ip" | "cidr" | "file" | "token" | "credential" | "text" | "network";
  recommendedActions: string[];
  executionTimeMs?: number;
}

/**
 * Pure function mapping any tool execution and its data to structured AI context.
 */
export function synthesizeAIContext(
  toolId: string,
  target?: string | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
): ToolHistoryAIContext {
  const safeData = data || {};

  switch (toolId) {
    case "internet-speed": {
      const down = safeData.downloadMbps ?? safeData.downloadSpeed ?? 0;
      const up = safeData.uploadMbps ?? safeData.uploadSpeed ?? 0;
      const ping = safeData.pingMs ?? safeData.latency ?? 0;
      const categories: string[] = safeData.categories || [];
      const bestUse = categories.length > 0 ? categories.slice(0, 2).join(", ") : "general browsing";

      return {
        summary: `Internet throughput tested at ${down} Mbps download and ${up} Mbps upload with ${ping}ms latency. Qualified for ${bestUse}.`,
        riskLevel: ping > 100 ? "low" : "none",
        keyFindings: [
          `Download speed: ${down} Mbps`,
          `Upload speed: ${up} Mbps`,
          `Latency: ${ping}ms`,
        ],
        targetType: "network",
        recommendedActions: ping > 100 ? ["Investigate local bufferbloat or ISP peering latency"] : [],
      };
    }

    case "ip-lookup": {
      const ip = target || safeData.ip || "Unknown IP";
      const country = safeData.country || "Unknown Country";
      const city = safeData.city || "Unknown City";
      const org = safeData.org || safeData.isp || safeData.asn || "Unknown ISP/Org";

      return {
        summary: `Geolocation lookup for ${ip} resolved to ${city}, ${country} operated by ${org}.`,
        riskLevel: "informational",
        keyFindings: [
          `IP: ${ip}`,
          `Location: ${city}, ${country}`,
          `Network: ${org}`,
        ],
        targetType: "ip",
        recommendedActions: [],
      };
    }

    case "dns-lookup": {
      const domain = target || safeData.domain || "Unknown Domain";
      const records = safeData.records || safeData.answers || {};
      const recordTypes = Object.keys(records);
      const txtRecords: string[] = Array.isArray(records.TXT) ? records.TXT : [];
      const hasSpf = txtRecords.some((r) => typeof r === "string" && r.includes("v=spf1"));
      const hasDmarc = txtRecords.some((r) => typeof r === "string" && r.includes("v=DMARC1"));

      const findings = [
        `Record types discovered: ${recordTypes.join(", ") || "None"}`,
      ];
      if (hasSpf) findings.push("SPF email authentication record detected");
      if (hasDmarc) findings.push("DMARC enforcement policy record detected");

      const recommendations: string[] = [];
      if (!hasSpf) recommendations.push("Consider deploying an SPF TXT record to mitigate email spoofing.");
      if (!hasDmarc) recommendations.push("Add a DMARC policy record to protect domain email reputation.");

      return {
        summary: `DNS query for ${domain} returned ${recordTypes.length} record categories. SPF: ${hasSpf ? "Present" : "Missing"}, DMARC: ${hasDmarc ? "Present" : "Missing"}.`,
        riskLevel: (!hasSpf || !hasDmarc) ? "low" : "none",
        keyFindings: findings,
        targetType: "hostname",
        recommendedActions: recommendations,
      };
    }

    case "subnet-calculator": {
      const cidr = target || safeData.cidr || safeData.input || "Unknown CIDR";
      const net = safeData.networkAddress || safeData.network || "N/A";
      const usable = safeData.usableHosts ?? safeData.totalHosts ?? 0;
      const range = safeData.hostRange ? `${safeData.hostRange.first} - ${safeData.hostRange.last}` : "N/A";

      return {
        summary: `Calculated IPv4 subnet allocation for ${cidr}. Network: ${net}, Usable host capacity: ${usable}.`,
        riskLevel: "informational",
        keyFindings: [
          `CIDR Prefix: ${cidr}`,
          `Network Boundary: ${net}`,
          `Usable Range: ${range}`,
          `Total Usable Hosts: ${usable}`,
        ],
        targetType: "cidr",
        recommendedActions: [],
      };
    }

    case "port-checker": {
      const host = target || safeData.host || "Unknown Host";
      const results: Array<{ port: number; status: string; service?: string }> = safeData.results || safeData.ports || [];
      const openPorts = results.filter((p) => p.status === "open").map((p) => p.port);
      const filteredPorts = results.filter((p) => p.status === "filtered").map((p) => p.port);

      const isHighRisk = openPorts.some((p) => [21, 23, 3389, 445, 139].includes(p));
      const riskLevel = isHighRisk ? "high" : (openPorts.length > 0 ? "low" : "none");

      const actions: string[] = [];
      if (isHighRisk) {
        actions.push("Immediately restrict or firewall legacy/insecure management ports (e.g. Telnet 23, FTP 21, RDP 3389).");
      }
      if (openPorts.includes(80) && !openPorts.includes(443)) {
        actions.push("Enable TLS/HTTPS (port 443) and redirect plaintext HTTP traffic.");
      }

      return {
        summary: `Port accessibility scan on ${host} checked ${results.length} ports. ${openPorts.length} open, ${filteredPorts.length} filtered.`,
        riskLevel,
        keyFindings: [
          `Open ports: ${openPorts.length > 0 ? openPorts.join(", ") : "None detected"}`,
          `Filtered/Firewalled: ${filteredPorts.length > 0 ? filteredPorts.join(", ") : "None"}`,
        ],
        targetType: "hostname",
        recommendedActions: actions,
      };
    }

    case "ping-latency": {
      const host = target || safeData.host || "Unknown Host";
      const median = safeData.medianMs ?? safeData.median ?? safeData.latency ?? 0;
      const jitter = safeData.jitterMs ?? safeData.jitter ?? 0;
      const loss = safeData.packetLossPercent ?? safeData.packetLoss ?? 0;

      const riskLevel = loss > 0 ? "medium" : (median > 150 ? "low" : "none");
      const actions: string[] = [];
      if (loss > 0) actions.push(`Investigate potential packet loss (${loss}%) along the transit route.`);
      if (jitter > 30) actions.push("High jitter detected; may impair real-time VoIP and video conferencing.");

      return {
        summary: `Round-trip latency diagnostic to ${host} completed with median ${median}ms and ${jitter}ms jitter. Packet loss: ${loss}%.`,
        riskLevel,
        keyFindings: [
          `Median Latency: ${median}ms`,
          `Jitter: ${jitter}ms`,
          `Packet Loss: ${loss}%`,
        ],
        targetType: "hostname",
        recommendedActions: actions,
      };
    }

    case "password-generator": {
      const len = safeData.length ?? 16;
      const entropy = safeData.entropyBits ?? safeData.entropy ?? (len * 5.95);
      return {
        summary: `Generated high-entropy random password (${len} characters, estimated ${Math.round(entropy)} bits entropy). Zero-knowledge redaction applied to secret.`,
        riskLevel: "none",
        keyFindings: [
          `Length: ${len} characters`,
          `Estimated Entropy: ~${Math.round(entropy)} bits`,
          `Plaintext secret redacted from storage for zero-knowledge safety.`,
        ],
        targetType: "credential",
        recommendedActions: ["Store generated credential in an encrypted password manager."],
      };
    }

    case "password-strength": {
      const score = safeData.score ?? 0; // 0-4
      const entropy = safeData.entropy ?? 0;
      const crackTime = safeData.crackTimeDisplay || safeData.crackTime || "Instant";
      const feedback = safeData.feedback || [];

      let riskLevel: ToolHistoryAIContext["riskLevel"] = "none";
      if (score <= 1) riskLevel = "high";
      else if (score <= 2) riskLevel = "medium";
      else if (score === 3) riskLevel = "low";

      return {
        summary: `Password strength evaluated at score ${score}/4 with ~${Math.round(entropy)} bits entropy. Estimated offline crack time: ${crackTime}.`,
        riskLevel,
        keyFindings: [
          `Strength Score: ${score} / 4`,
          `Entropy: ${Math.round(entropy)} bits`,
          `Estimated Crack Time: ${crackTime}`,
        ],
        targetType: "credential",
        recommendedActions: feedback.length > 0 ? feedback.slice(0, 3) : ["Enable multi-factor authentication (MFA)."],
      };
    }

    case "hash-generator": {
      const algorithm = safeData.algorithm || "SHA-256";
      const inputLen = safeData.inputLength ?? 0;

      return {
        summary: `Generated ${algorithm} cryptographic hash digest for ${inputLen}-character payload.`,
        riskLevel: "informational",
        keyFindings: [
          `Algorithm: ${algorithm}`,
          `Input Size: ${inputLen} characters`,
        ],
        targetType: "text",
        recommendedActions: ["Use SHA-256 or SHA-512 for cryptographic integrity verification."],
      };
    }

    case "jwt-decoder": {
      const alg = safeData.header?.alg || safeData.alg || "Unknown";
      const sub = safeData.payload?.sub || safeData.sub || "Unspecified Subject";
      const isExpired = safeData.isExpired ?? false;
      const expDate = safeData.expirationDate || "None";

      let riskLevel: ToolHistoryAIContext["riskLevel"] = "none";
      if (alg.toLowerCase() === "none") riskLevel = "high";
      else if (isExpired) riskLevel = "medium";

      const actions: string[] = [];
      if (alg.toLowerCase() === "none") {
        actions.push("CRITICAL: Token algorithm is 'none'. Unsigned tokens are vulnerable to signature-stripping forgery.");
      }
      if (isExpired) {
        actions.push("Session token has expired. User requests will be rejected with 401 Unauthorized until refreshed.");
      }

      return {
        summary: `Decoded JWT for subject '${sub}' using algorithm '${alg}'. Status: ${isExpired ? "EXPIRED" : "Active"}.`,
        riskLevel,
        keyFindings: [
          `Algorithm: ${alg}`,
          `Subject (sub): ${sub}`,
          `Status: ${isExpired ? "Expired" : "Active"} (Expires: ${expDate})`,
        ],
        targetType: "token",
        recommendedActions: actions,
      };
    }

    case "file-hash": {
      const fileName = safeData.fileName || target || "Uploaded File";
      const size = safeData.fileSize ? `${Math.round(safeData.fileSize / 1024)} KB` : "Unknown Size";
      const matched = safeData.matched;

      let riskLevel: ToolHistoryAIContext["riskLevel"] = "none";
      if (matched === false) riskLevel = "high";

      const actions: string[] = [];
      if (matched === false) {
        actions.push("ALERT: File checksum does NOT match reference hash. File may be corrupted, modified, or tampered with.");
      }

      return {
        summary: `Calculated integrity checksums for file '${fileName}' (${size}). Verification status: ${matched === true ? "VALID MATCH" : matched === false ? "TAMPERED / MISMATCH" : "Computed"}.`,
        riskLevel,
        keyFindings: [
          `File: ${fileName} (${size})`,
          `Verification Status: ${matched === true ? "Verified Match" : matched === false ? "Checksum Mismatch!" : "Computed Successfully"}`,
        ],
        targetType: "file",
        recommendedActions: actions,
      };
    }

    case "security-headers": {
      const url = target || safeData.url || "Target Website";
      const grade = safeData.grade || "F";
      const missing: string[] = safeData.missingHeaders || [];
      const present: string[] = safeData.presentHeaders || [];

      let riskLevel: ToolHistoryAIContext["riskLevel"] = "none";
      if (["F", "E"].includes(grade)) riskLevel = "high";
      else if (["D", "C"].includes(grade)) riskLevel = "medium";
      else if (grade === "B") riskLevel = "low";

      const actions: string[] = [];
      if (missing.includes("Content-Security-Policy")) {
        actions.push("Implement Content-Security-Policy (CSP) to restrict script sources and defend against Cross-Site Scripting (XSS).");
      }
      if (missing.includes("Strict-Transport-Security")) {
        actions.push("Add Strict-Transport-Security (HSTS) with max-age=31536000 and includeSubDomains to enforce HTTPS.");
      }

      return {
        summary: `Security header assessment of ${url} scored Grade ${grade}. Detected ${present.length} active headers, ${missing.length} missing defensive headers.`,
        riskLevel,
        keyFindings: [
          `Security Grade: ${grade}`,
          `Missing Guardrails: ${missing.length > 0 ? missing.slice(0, 4).join(", ") : "None (fully hardened)"}`,
        ],
        targetType: "hostname",
        recommendedActions: actions,
      };
    }

    case "binary-text": {
      const mode = safeData.mode || "text-to-binary";
      const length = safeData.inputLength ?? 0;

      return {
        summary: `Bytecode conversion completed in mode '${mode}' for ${length} items.`,
        riskLevel: "none",
        keyFindings: [
          `Direction: ${mode}`,
          `Data Volume: ${length} elements`,
        ],
        targetType: "text",
        recommendedActions: [],
      };
    }

    default: {
      return {
        summary: `Diagnostic execution for ${toolId}${target ? ` on target ${target}` : ""}.`,
        riskLevel: "informational",
        keyFindings: [`Tool: ${toolId}`, target ? `Target: ${target}` : ""].filter(Boolean),
        targetType: "hostname",
        recommendedActions: [],
      };
    }
  }
}
