import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const verifySchema = z.object({
  pin: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = verifySchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }

  const { pin } = parseResult.data;

  // Vercel Serverless Protection: Limit to 10 attempts per minute per IP using Upstash
  const { checkRateLimit } = await import("@/core/tool-kit/runner");
  const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
  const allowed = await checkRateLimit(`commander-verify:${ip}`, 10, 60000);
  
  if (!allowed) {
    return NextResponse.json({ success: false, error: "Rate limit exceeded. Protocol Zero engaged." }, { status: 429 });
  }

  // Uses env var or defaults to a fun CS:GO bomb code if not set for testing
  const expectedPin = process.env.COMMANDER_PIN || "7355608";

  const { saveToolHistory } = await import("@/db/queries/history");
  
  // Capture client info for Commander Logs
  const userAgent = req.headers.get("user-agent") || "";
  const clientInfo = { browser: "Unknown", os: "Unknown", device: "Desktop", ip };
  if (/Mobile|Android|iP(hone|od|ad)/i.test(userAgent)) clientInfo.device = "Mobile";
  if (/Mac OS X/.test(userAgent)) clientInfo.os = "macOS";
  else if (/Windows/.test(userAgent)) clientInfo.os = "Windows";
  else if (/Linux/.test(userAgent)) clientInfo.os = "Linux";
  if (/Chrome/.test(userAgent)) clientInfo.browser = "Chrome";
  else if (/Safari/.test(userAgent)) clientInfo.browser = "Safari";
  else if (/Firefox/.test(userAgent)) clientInfo.browser = "Firefox";

  if (pin === expectedPin) {
    // Note: We don't issue a cookie. Access is kept purely in React State 
    // for extreme volatility (F5 clears access).
    await saveToolHistory("COMMANDER_HQ", "AUTH_GRANT", { _clientContext: clientInfo, error: null }, "SYSTEM", undefined, 20);
    return NextResponse.json({ success: true });
  }

  // Artificial delay to prevent brute-forcing
  await new Promise(resolve => setTimeout(resolve, 500));
  await saveToolHistory("COMMANDER_HQ", "AUTH_DENY", { _clientContext: clientInfo, error: "Invalid PIN Attempt" }, "SYSTEM", undefined, 20);

  return NextResponse.json({ success: false }, { status: 401 });
}
