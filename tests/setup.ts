import { vi } from "vitest";

// Mock server-only package so server modules can be tested in JSDOM environment
vi.mock("server-only", () => ({}));
