import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile, updateUserProfile } from "@/db/queries/users";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be 50 characters or fewer"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getUserProfile(session.user.id);
  return NextResponse.json({
    userId: session.user.id,
    displayName: profile?.displayName || session.user.name || "Agent",
    email: session.user.email,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }

  const updated = await updateUserProfile(session.user.id, parsed.data.displayName);
  return NextResponse.json({
    success: true,
    displayName: updated?.displayName || parsed.data.displayName,
  });
}
