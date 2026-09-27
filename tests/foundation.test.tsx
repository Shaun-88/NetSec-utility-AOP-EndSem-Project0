import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../src/app/page";
import { usersProfile, toolHistory } from "../src/db/schema";
import { getTableColumns } from "drizzle-orm";

describe("Phase 1: Foundation Verification", () => {
  it("renders the placeholder page with branding and title", () => {
    render(<Home />);
    expect(
      screen.getAllByText("The Big Bro's NetSec Armoury").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("Phase 1: Foundation Completed"),
    ).toBeTruthy();
    expect(
      screen.getByText("Drizzle + Postgres"),
    ).toBeTruthy();
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
