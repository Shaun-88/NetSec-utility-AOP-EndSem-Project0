import { describe, it, expect } from "vitest";
import { usersProfile, toolHistory } from "../src/db/schema";
import { getTableColumns } from "drizzle-orm";

describe("Phase 1: Foundation Verification", () => {
  it("verifies foundational schema contracts", () => {
    expect(usersProfile).toBeDefined();
    expect(toolHistory).toBeDefined();
  });

  it("verifies the users_profile Drizzle schema definition", () => {
    const columns = getTableColumns(usersProfile);
    expect(columns.userId).toBeDefined();
    expect(columns.displayName).toBeDefined();
    expect(columns.createdAt).toBeDefined();
  });

  it("verifies the tool_history Drizzle schema definition", () => {
    const columns = getTableColumns(toolHistory);
    expect(columns.id).toBeDefined();
    expect(columns.userId).toBeDefined();
    expect(columns.toolId).toBeDefined();
    expect(columns.target).toBeDefined();
    expect(columns.data).toBeDefined();
    expect(columns.ranAt).toBeDefined();
  });
});
