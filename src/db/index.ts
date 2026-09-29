import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

// If Neon provided DATABASE_URL instead of POSTGRES_URL, alias it for @vercel/postgres
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

/**
 * Primary Drizzle database client instance connected via Vercel Postgres.
 */
export const db = drizzle(sql, { schema });

export * from "./schema";
