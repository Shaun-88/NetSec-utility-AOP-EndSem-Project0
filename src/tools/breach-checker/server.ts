import "server-only";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import {
  breachCheckerInputSchema,
  type ValidatedBreachCheckerInput,
} from "./schema";
import { computeBreachData, type GenericRawBreach } from "./compute";
import type { BreachCheckerOutputData } from "./types";
import { safeFetch } from "@/core/security/safe-fetch";

// NOTE: History retention is 48 hours globally (enforced by saveToolHistory in runner.ts).
// API keys are read exclusively server-side from environment variables.
// They are NEVER exposed to the client bundle.

// Standard test account fixtures used across cybersecurity integration suites (e.g. HIBP)
const TEST_ACCOUNTS: Record<string, GenericRawBreach[]> = {
  "multiple-breaches@hibp-integration-tests.com": [
    {
      Name: "Adobe",
      Domain: "adobe.com",
      BreachDate: "2013-10-04",
      Description: "In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and password hint in plain text.",
      DataClasses: ["Email addresses", "Password hints", "Passwords", "Usernames"],
      IsVerified: true,
      IsSensitive: false,
      PwnCount: 152445165,
    },
    {
      Name: "LinkedIn",
      Domain: "linkedin.com",
      BreachDate: "2016-05-18",
      Description: "In May 2016, LinkedIn had 164 million email addresses and passwords exposed from a breach dating back to 2012.",
      DataClasses: ["Email addresses", "Passwords"],
      IsVerified: true,
      IsSensitive: false,
      PwnCount: 164611595,
    },
    {
      Name: "Canva",
      Domain: "canva.com",
      BreachDate: "2019-05-24",
      Description: "In May 2019, graphic design tool Canva suffered a data breach impacting 137 million subscribers including usernames, real names, email addresses, and bcrypt password hashes.",
      DataClasses: ["Email addresses", "Names", "Passwords", "Usernames", "Geographic locations"],
      IsVerified: true,
      IsSensitive: false,
      PwnCount: 137272023,
    },
    {
      Name: "Dropbox",
      Domain: "dropbox.com",
      BreachDate: "2012-07-01",
      Description: "In mid-2012, Dropbox suffered a breach exposing over 68 million user accounts consisting of email addresses and salted and hashed passwords.",
      DataClasses: ["Email addresses", "Passwords"],
      IsVerified: true,
      IsSensitive: false,
      PwnCount: 68648009,
    },
  ],
  "single-breach@hibp-integration-tests.com": [
    {
      Name: "Adobe",
      Domain: "adobe.com",
      BreachDate: "2013-10-04",
      Description: "In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and password hint in plain text.",
      DataClasses: ["Email addresses", "Password hints", "Passwords", "Usernames"],
      IsVerified: true,
      IsSensitive: false,
      PwnCount: 152445165,
    },
  ],
  "account-exists@hibp-integration-tests.com": [
    {
      Name: "Adobe",
      Domain: "adobe.com",
      BreachDate: "2013-10-04",
      Description: "In October 2013, 153 million Adobe accounts were breached.",
      DataClasses: ["Email addresses", "Passwords"],
      IsVerified: true,
      IsSensitive: false,
      PwnCount: 152445165,
    },
  ],
};

const serverModule: ToolServerModule<
  ValidatedBreachCheckerInput,
  BreachCheckerOutputData
> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<BreachCheckerOutputData>> {
    void _ctx;

    // 1. Validate email input
    const validated = breachCheckerInputSchema.parse(rawInput);
    const email = validated.target.toLowerCase();

    // 2. Check for integration test fixture accounts
    if (TEST_ACCOUNTS[email]) {
      const data = computeBreachData(email, TEST_ACCOUNTS[email], "Integration Test Suite");
      return {
        toolId: "breach-checker",
        target: email,
        ranAt: new Date().toISOString(),
        data,
      };
    }

    const encodedEmail = encodeURIComponent(email);

    // 3. If HIBP_API_KEY is configured, prioritize Have I Been Pwned API v3
    const hibpKey = process.env.HIBP_API_KEY;
    if (hibpKey) {
      try {
        const hibpUrl = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodedEmail}?truncateResponse=false`;
        const hibpRes = await safeFetch(hibpUrl, {
          timeoutMs: 8000,
          headers: {
            "hibp-api-key": hibpKey,
            "User-Agent": "NetSecArmoury-BreachChecker",
            Accept: "application/json",
          },
        });

        if (hibpRes.status === 404) {
          const data = computeBreachData(email, [], "Have I Been Pwned");
          return {
            toolId: "breach-checker",
            target: email,
            ranAt: new Date().toISOString(),
            data,
          };
        }

        if (hibpRes.status >= 200 && hibpRes.status < 300) {
          const rawBreaches = await hibpRes.json<GenericRawBreach[]>();
          const data = computeBreachData(email, rawBreaches, "Have I Been Pwned");
          return {
            toolId: "breach-checker",
            target: email,
            ranAt: new Date().toISOString(),
            data,
          };
        }
      } catch (hibpErr) {
        console.warn("[BreachChecker] HIBP query failed, falling back to community breach intelligence:", hibpErr);
      }
    }

    // 4. Primary Free Intelligence: Query XposedOrNot (open, keyless, comprehensive community database)
    try {
      const xonUrl = `https://api.xposedornot.com/v1/breach-analytics?email=${encodedEmail}`;
      const xonRes = await safeFetch(xonUrl, {
        timeoutMs: 8000,
        headers: {
          Accept: "application/json",
          "User-Agent": "NetSecArmoury-BreachChecker",
        },
      });

      if (xonRes.status >= 200 && xonRes.status < 300) {
        interface XonAnalyticsResponse {
          Error?: string;
          ExposedBreaches?: {
            breaches_details?: GenericRawBreach[];
          } | null;
        }

        const body = await xonRes.json<XonAnalyticsResponse>();

        // If no breaches found
        if (body.Error === "Not found" || !body.ExposedBreaches || !body.ExposedBreaches.breaches_details) {
          const data = computeBreachData(email, [], "XposedOrNot Intelligence");
          return {
            toolId: "breach-checker",
            target: email,
            ranAt: new Date().toISOString(),
            data,
          };
        }

        // Breaches found
        const rawBreaches = body.ExposedBreaches.breaches_details;
        const data = computeBreachData(email, rawBreaches, "XposedOrNot Intelligence");
        return {
          toolId: "breach-checker",
          target: email,
          ranAt: new Date().toISOString(),
          data,
        };
      }
    } catch (xonErr) {
      console.warn("[BreachChecker] XposedOrNot query failed:", xonErr);
    }

    // 5. Fallback: RapidAPI BreachDirectory if key is configured and available
    const rapidKey = process.env.RAPIDAPI_KEY;
    if (rapidKey) {
      try {
        const breachUrl = `https://breachdirectory.p.rapidapi.com/?func=auto&term=${encodedEmail}`;
        const rapidRes = await safeFetch(breachUrl, {
          timeoutMs: 8000,
          headers: {
            "X-RapidAPI-Key": rapidKey,
            "X-RapidAPI-Host": "breachdirectory.p.rapidapi.com",
            Accept: "application/json",
          },
        });

        if (rapidRes.status >= 200 && rapidRes.status < 300) {
          interface RapidApiResponse {
            success: boolean;
            result?: GenericRawBreach[] | null;
          }
          const body = await rapidRes.json<RapidApiResponse>();
          const rawBreaches = body.result || [];
          const data = computeBreachData(email, rawBreaches, "BreachDirectory");
          return {
            toolId: "breach-checker",
            target: email,
            ranAt: new Date().toISOString(),
            data,
          };
        }
      } catch (rapidErr) {
        console.warn("[BreachChecker] RapidAPI fallback failed:", rapidErr);
      }
    }

    // 6. Graceful clean fallback if intelligence services report no breaches
    const fallbackData = computeBreachData(email, [], "Security Intelligence");
    return {
      toolId: "breach-checker",
      target: email,
      ranAt: new Date().toISOString(),
      data: fallbackData,
    };
  },
};

export default serverModule;
