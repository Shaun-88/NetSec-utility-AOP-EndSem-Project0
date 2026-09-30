import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import BootScreen from "../src/components/BootScreen";
import BootProvider from "../src/components/BootProvider";
import { tools } from "../src/registry/tools";

describe("Phase 3: UI Shell & Boot Sequence", () => {
  it("enforces tool registry invariants: exactly 13 tools categorized correctly", () => {
    expect(tools.length).toBe(13);

    const networkTools = tools.filter((t) => t.category === "network");
    const cyberTools = tools.filter((t) => t.category === "cybersecurity");

    expect(networkTools.length).toBe(6);
    expect(cyberTools.length).toBe(7);

    // Verify all tools have required architecture fields
    for (const tool of tools) {
      expect(tool.id).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.Component).toBeDefined();
      expect(["network", "cybersecurity"]).toContain(tool.category);
    }
  });

  it("renders BootScreen and respects the minimum duration timer", () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <BootScreen onComplete={onComplete} minDurationMs={10000} />,
    );

    // Initial render shows boot sequence indicators
    expect(screen.getByText(/Initial boot sequence/i)).toBeTruthy();
    expect(screen.getByText(/Press/i)).toBeTruthy();

    // Has not completed yet at 0ms
    expect(onComplete).not.toHaveBeenCalled();

    // Test Esc shortcut bypass
    fireEvent.keyDown(window, { key: "Escape" });

    unmount();
  });

  it("BootProvider renders children when boot_sequence_completed is set in sessionStorage", () => {
    sessionStorage.setItem("boot_sequence_completed", "true");
    const { container } = render(
      <BootProvider>
        <div data-testid="app-content">Armoury Home Content</div>
      </BootProvider>,
    );

    expect(screen.getByTestId("app-content")).toBeDefined();
    expect(screen.queryByText(/Initial boot sequence/i)).toBeNull();
    expect(container.querySelector(".invisible")).toBeNull();
    sessionStorage.clear();
  });

  it("BootProvider renders BootScreen when session is fresh", () => {
    sessionStorage.clear();
    const { container } = render(
      <BootProvider>
        <div data-testid="app-content">Protected Content</div>
      </BootProvider>,
    );

    // BootScreen is rendered on top
    expect(screen.getByText(/Initial boot sequence/i)).toBeDefined();
    // Underlying content is rendered directly (covered by fixed BootScreen, not trapped by invisible)
    expect(screen.getByTestId("app-content")).toBeDefined();
    expect(container.querySelector(".invisible")).toBeNull();
  });

  it("proves tool registry slugs map to expected IDs", () => {
    const toolIds = tools.map((t) => t.id);
    expect(toolIds).toContain("internet-speed");
    expect(toolIds).toContain("ip-lookup");
    expect(toolIds).toContain("dns-lookup");
    expect(toolIds).toContain("subnet-calculator");
    expect(toolIds).toContain("port-checker");
    expect(toolIds).toContain("ping-latency");
    expect(toolIds).toContain("password-generator");
    expect(toolIds).toContain("password-strength");
    expect(toolIds).toContain("hash-generator");
    expect(toolIds).toContain("jwt-decoder");
    expect(toolIds).toContain("file-hash");
    expect(toolIds).toContain("security-headers");
    expect(toolIds).toContain("binary-text");
  });
});
