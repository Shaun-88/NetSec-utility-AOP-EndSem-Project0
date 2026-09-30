import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { tools } from "@/registry/tools";
import { saveToolHistory } from "@/db/queries/history";
import { synthesizeAIContext } from "@/core/history/ai-synthesizer";

/**
 * Client-Side Tool History Logging Endpoint: POST /api/history/log
 * Securely captures client-side tool executions (Subnet Calculator, Password Strength,
 * Hash Generator, JWT Decoder, Binary Converter, Password Generator).
 * 
 * SECURITY INVARIANTS:
 * 1. Requires verified server-side session.
 * 2. Redacts plaintext sensitive secrets (zero-knowledge password security).
 * 3. Enriches execution with structured AI context for the AI Zone.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required to log tool history." },
      { status: 401 },
    );
  }

  let body: {
    toolId?: string;
    target?: string | null;
    data?: Record<string, unknown>;
  } = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const { toolId, target, data = {} } = body;

  if (!toolId || typeof toolId !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid toolId parameter." },
      { status: 400 },
    );
  }

  const registeredTool = tools.find((t) => t.id === toolId);
  if (!registeredTool) {
    return NextResponse.json(
      { error: `Tool '${toolId}' is not registered in NetSec Armoury.` },
      { status: 404 },
    );
  }

  // --- Security Sanitization & Zero-Knowledge Redaction ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitizedData: any = { ...data };

  if (toolId === "password-generator") {
    // SECURITY: NEVER persist generated plaintext passwords to database
    delete sanitizedData.password;
    delete sanitizedData.plaintext;
    sanitizedData.redacted = true;
    sanitizedData.note = "Plaintext secret redacted from database storage for zero-knowledge security.";
  } else if (toolId === "jwt-decoder") {
    // Redact cryptographic signature payload
    if (sanitizedData.signature) {
      sanitizedData.signature = "[REDACTED_SIGNATURE]";
    }
  }

  // Synthesize AI context
  const aiContext = synthesizeAIContext(toolId, target, sanitizedData);

  // Persist to user's isolated history
  const record = await saveToolHistory(
    userId,
    toolId,
    sanitizedData,
    target || null,
    aiContext,
  );

  return NextResponse.json({
    success: true,
    id: record?.id,
  });
}
