import "server-only";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import {
  pwnedPasswordInputSchema,
  type ValidatedPwnedPasswordInput,
} from "./schema";
import { parsePwnedPasswordResponse } from "./compute";
import type { PwnedPasswordOutputData } from "./types";
import { safeFetch } from "@/core/security/safe-fetch";

// NOTE: The HIBP Pwned Passwords range API requires NO API key and is completely free.
// Only the 5-character hash prefix is sent — the plaintext password never reaches this server.

const serverModule: ToolServerModule<
  ValidatedPwnedPasswordInput,
  PwnedPasswordOutputData
> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<PwnedPasswordOutputData>> {
    void _ctx;

    // 1. Validate prefix and fullHash
    const validated = pwnedPasswordInputSchema.parse(rawInput);
    const { prefix, fullHash } = validated;

    // 2. Call HIBP Pwned Passwords range API — no API key required.
    // Only the 5-char prefix is transmitted; fullHash is used ONLY locally to find the match.
    const hibpUrl = `https://api.pwnedpasswords.com/range/${prefix.toUpperCase()}`;

    const response = await safeFetch(hibpUrl, {
      timeoutMs: 8000,
      headers: {
        "Add-Padding": "true", // HIBP padding mode prevents traffic analysis
      },
    });

    if (response.status === 429) {
      throw new Error(
        "HIBP Pwned Passwords rate limit exceeded. Please wait a moment and try again.",
      );
    }
    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `HIBP Pwned Passwords API returned unexpected status ${response.status}.`,
      );
    }

    const responseText = await response.text();

    // 3. Parse the plain-text response and find the matching hash
    const data = parsePwnedPasswordResponse(responseText, fullHash, prefix);

    // 4. Return ToolResult
    return {
      toolId: "pwned-password",
      ranAt: new Date().toISOString(),
      data,
    };
  },
};

export default serverModule;
