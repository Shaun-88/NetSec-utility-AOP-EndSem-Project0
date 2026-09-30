/**
 * Client-Side History Logging Utility
 * Sends background execution telemetry for client-only tools to /api/history/log.
 * Fails silently if user is unauthenticated or network is offline.
 */
export async function logClientToolRun(
  toolId: string,
  target?: string | null,
  data?: unknown,
): Promise<void> {
  try {
    await fetch("/api/history/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toolId,
        target: target || null,
        data: data || {},
      }),
    });
  } catch {
    // Non-blocking fire-and-forget: do not interrupt user workflow if offline
  }
}

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Debounced variant for interactive inputs (e.g. typing an IP or password).
 * Automatically cancels pending logs until user stops typing for delayMs.
 */
export function logClientToolRunDebounced(
  toolId: string,
  target?: string | null,
  data?: unknown,
  delayMs: number = 1500,
): void {
  const key = `${toolId}:${target || "default"}`;
  const existing = debounceTimers.get(key);
  if (existing) {
    clearTimeout(existing);
  }

  const timer = setTimeout(() => {
    debounceTimers.delete(key);
    logClientToolRun(toolId, target, data);
  }, delayMs);

  debounceTimers.set(key, timer);
}
