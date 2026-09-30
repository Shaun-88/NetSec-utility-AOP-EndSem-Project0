"use client";

import React, { useEffect, useState } from "react";
import BootScreen from "./BootScreen";

export default function BootProvider({
  children,
  initialBooted = false,
}: {
  children: React.ReactNode;
  initialBooted?: boolean;
}) {
  const [hasBooted, setHasBooted] = useState<boolean>(initialBooted);

  useEffect(() => {
    // If server already verified the boot cookie, do nothing
    if (initialBooted) return;

    // Check if boot sequence has already executed in this browser session
    try {
      const bootedSession = sessionStorage.getItem("boot_sequence_completed");
      const hasCookie =
        typeof document !== "undefined" &&
        document.cookie.includes("app_booted=true");
      if (bootedSession === "true" || hasCookie) {
        setHasBooted(true);
      }
    } catch {
      // Fallback if storage is restricted
      setHasBooted(true);
    }
  }, [initialBooted]);

  const handleBootComplete = React.useCallback(() => {
    try {
      sessionStorage.setItem("boot_sequence_completed", "true");
      if (typeof document !== "undefined") {
        document.cookie = "app_booted=true; path=/; SameSite=Lax";
      }
    } catch {
      // ignore
    }
    setHasBooted(true);
  }, []);

  return (
    <>
      {!hasBooted && (
        <BootScreen onComplete={handleBootComplete} minDurationMs={10000} />
      )}
      {children}
    </>
  );
}
