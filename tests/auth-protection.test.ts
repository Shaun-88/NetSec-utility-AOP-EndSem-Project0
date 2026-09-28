import { describe, it, expect } from "vitest";
import { executeToolFrontDoor } from "../src/core/tool-kit/runner";
import { authConfig } from "../src/auth.config";

describe("Phase 2 Acceptance: Route & API Protection", () => {
  it("rejects unauthenticated requests to the tool front door with 401", async () => {
    const response = await executeToolFrontDoor({
      toolId: "template",
      userId: "", // No authenticated user ID
      body: { target: "example.com" },
    });

    expect(response.success).toBe(false);
    expect(response.status).toBe(401);
    expect(response.error).toContain("Authentication required");
  });

  it("returns 404 for unknown tool requests", async () => {
    const response = await executeToolFrontDoor({
      toolId: "non-existent-tool-xyz",
      userId: "test-user-123",
      body: {},
    });

    expect(response.success).toBe(false);
    expect(response.status).toBe(404);
    expect(response.error).toContain("is not registered");
  });

  it("successfully executes registered template tool when authenticated", async () => {
    const response = await executeToolFrontDoor({
      toolId: "template",
      userId: "authenticated-tester",
      body: { target: "safe-target.org", sampleOption: true },
    });

    expect(response.success).toBe(true);
    expect(response.status).toBe(200);
    expect(response.result).toBeDefined();
    expect(response.result?.toolId).toBe("template");
    expect(response.result?.target).toBe("safe-target.org");
    expect(response.result?.data).toHaveProperty("computedScore");
  });

  it("middleware authorized callback redirects unauthenticated users from protected routes", () => {
    const authorized = authConfig.callbacks?.authorized;
    expect(authorized).toBeDefined();

    if (authorized) {
      // Unauthenticated access to home page / -> should be false (redirects)
      const homeAccess = (authorized as any)({
        auth: null,
        request: { nextUrl: new URL("http://localhost:3000/") },
      });
      expect(homeAccess).toBe(false);

      // Unauthenticated access to a tool page -> should be false
      const toolAccess = (authorized as any)({
        auth: null,
        request: { nextUrl: new URL("http://localhost:3000/tools/ip-lookup") },
      });
      expect(toolAccess).toBe(false);

      // Unauthenticated access to /signin -> should be true (allowed)
      const signinAccess = (authorized as any)({
        auth: null,
        request: { nextUrl: new URL("http://localhost:3000/signin") },
      });
      expect(signinAccess).toBe(true);

      // Authenticated access to home page -> should be true
      const authUserAccess = (authorized as any)({
        auth: { user: { id: "user_123", name: "Agent Shaun" } },
        request: { nextUrl: new URL("http://localhost:3000/") },
      });
      expect(authUserAccess).toBe(true);
    }
  });
});
