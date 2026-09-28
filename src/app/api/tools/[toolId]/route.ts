import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { executeToolFrontDoor } from "@/core/tool-kit/runner";

/**
 * Universal Tool Front Door API Endpoint: POST /api/tools/[toolId]
 * Routes execution through the centralized security, timeout, and persistence pipeline.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ toolId: string }> },
) {
  const { toolId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in." },
      { status: 401 },
    );
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const output = await executeToolFrontDoor({
    toolId,
    userId,
    body,
  });

  return NextResponse.json(
    output.success ? output.result : { error: output.error },
    { status: output.status },
  );
}
