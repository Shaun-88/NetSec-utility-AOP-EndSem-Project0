import "server-only";
import { db } from "../index";
import { usersProfile, type UserProfile } from "../schema";
import { eq } from "drizzle-orm";

/**
 * Retrieves a user profile by authenticated user_id.
 * Always strictly filters by authenticated user_id for tenant isolation.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return null;
  }
  try {
    const rows = await db
      .select()
      .from(usersProfile)
      .where(eq(usersProfile.userId, userId))
      .limit(1);

    return rows[0] || null;
  } catch (err) {
    console.error(`[DB Error] getUserProfile failed for ${userId}:`, err);
    return null;
  }
}

/**
 * Creates or updates a user profile record for the authenticated user.
 */
export async function ensureUserProfile(
  userId: string,
  displayName: string,
): Promise<UserProfile | null> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return {
      userId,
      displayName,
      createdAt: new Date(),
    };
  }
  try {
    const existing = await getUserProfile(userId);
    if (existing) {
      return existing;
    }

    const inserted = await db
      .insert(usersProfile)
      .values({
        userId,
        displayName: displayName || "Security Agent",
      })
      .returning();

    return inserted[0] || null;
  } catch (err) {
    console.error(`[DB Error] ensureUserProfile failed for ${userId}:`, err);
    return null;
  }
}

/**
 * Updates a user's display name.
 */
export async function updateUserProfile(
  userId: string,
  displayName: string,
): Promise<UserProfile | null> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return {
      userId,
      displayName,
      createdAt: new Date(),
    };
  }
  try {
    const updated = await db
      .update(usersProfile)
      .set({ displayName })
      .where(eq(usersProfile.userId, userId))
      .returning();

    return updated[0] || null;
  } catch (err) {
    console.error(`[DB Error] updateUserProfile failed for ${userId}:`, err);
    return null;
  }
}
