import { pgTable, text, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";

/**
 * users_profile table
 * Stores user preferences and display name prompt results
 */
export const usersProfile = pgTable("users_profile", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * tool_history table
 * Stores append-only history of tool executions per user
 */
export const toolHistory = pgTable(
  "tool_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    toolId: text("tool_id").notNull(),
    target: text("target"),
    data: jsonb("data").notNull(),
    ranAt: timestamp("ran_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("tool_history_user_idx").on(table.userId, table.ranAt.desc()),
  ],
);

export type UserProfile = typeof usersProfile.$inferSelect;
export type NewUserProfile = typeof usersProfile.$inferInsert;

export type ToolHistoryRecord = typeof toolHistory.$inferSelect;
export type NewToolHistoryRecord = typeof toolHistory.$inferInsert;
