import type { BreachEntry, BreachCheckerOutputData } from "./types";

/**
 * Raw breach representation from any supported upstream provider.
 */
export interface GenericRawBreach {
  // HIBP fields
  Name?: string;
  Title?: string;
  Domain?: string;
  BreachDate?: string;
  Description?: string;
  DataClasses?: string[];
  IsVerified?: boolean;
  IsSensitive?: boolean;
  PwnCount?: number;

  // XposedOrNot fields
  breach?: string;
  domain?: string;
  xposed_date?: string;
  details?: string;
  xposed_data?: string;
  xposed_records?: number;
  verified?: boolean | string;
  sensitive?: boolean | string;
  logo?: string;

  // BreachDirectory fields
  sources?: string[] | string;
  email?: string;
  has_password?: boolean;
  password?: string;
}

/**
 * Strips HTML tags from text descriptions.
 */
function cleanDescription(desc?: string): string {
  if (!desc) return "";
  return desc
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Pure compute function for Breach Checker.
 * Transforms raw provider responses into standardized, sorted BreachEntry items.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeBreachData(
  email: string,
  rawBreaches: GenericRawBreach[],
  provider: string = "XposedOrNot",
): BreachCheckerOutputData {
  const breaches: BreachEntry[] = [];
  const seenNames = new Set<string>();

  for (const item of rawBreaches) {
    // 1. Determine name
    const rawName = item.Title || item.Name || item.breach || (typeof item.sources === "string" ? item.sources : Array.isArray(item.sources) ? item.sources[0] : "") || "Unknown Breach";
    const name = rawName.trim();
    if (!name || seenNames.has(name.toLowerCase())) {
      continue;
    }
    seenNames.add(name.toLowerCase());

    // 2. Determine domain
    const domain = item.Domain || item.domain || undefined;

    // 3. Determine breach date
    const breachDate = item.BreachDate || item.xposed_date || undefined;

    // 4. Determine description
    const description = cleanDescription(item.Description || item.details);

    // 5. Determine exposed data classes
    let dataClasses: string[] = [];
    if (Array.isArray(item.DataClasses)) {
      dataClasses = item.DataClasses;
    } else if (typeof item.xposed_data === "string") {
      dataClasses = item.xposed_data.split(";").map((d) => d.trim()).filter(Boolean);
    } else if (item.has_password || (typeof item.password === "string" && item.password.length > 0)) {
      dataClasses = ["Passwords", "Email addresses"];
    } else {
      dataClasses = ["Email addresses"];
    }

    // 6. Check password flag
    const hasPassword =
      dataClasses.some((c) => /password/i.test(c)) ||
      Boolean(item.has_password) ||
      (typeof item.password === "string" && item.password.trim().length > 0);

    // 7. Pwn count
    const pwnCount = item.PwnCount ?? item.xposed_records ?? undefined;

    // 8. Verified / Sensitive flags
    const isVerified =
      item.IsVerified !== undefined
        ? item.IsVerified
        : typeof item.verified === "boolean"
        ? item.verified
        : String(item.verified).toLowerCase() === "yes";

    const isSensitive =
      item.IsSensitive !== undefined
        ? item.IsSensitive
        : typeof item.sensitive === "boolean"
        ? item.sensitive
        : String(item.sensitive).toLowerCase() === "yes";

    // 9. Logo
    const logo = item.logo || undefined;

    breaches.push({
      name,
      domain,
      breachDate,
      description,
      dataClasses,
      isVerified,
      isSensitive,
      pwnCount,
      logo,
      hasPassword,
    });
  }

  // Sort breaches by date descending if dates are available
  breaches.sort((a, b) => {
    if (a.breachDate && b.breachDate) {
      return b.breachDate.localeCompare(a.breachDate);
    }
    return a.name.localeCompare(b.name);
  });

  return {
    email,
    breachCount: breaches.length,
    isClean: breaches.length === 0,
    breaches,
    checkedAt: new Date().toISOString(),
    provider,
  };
}
