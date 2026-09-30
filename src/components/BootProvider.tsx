"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import BootScreen from "./BootScreen";

export default function BootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Start with hasBooted false so BootScreen covers the viewport from frame 0
  const [hasBooted, setHasBooted] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    // If on signin, always reset boot flag so BootScreen plays first on fresh open / refresh
    if (pathname === "/signin") {
      try {
        sessionStorage.removeItem("boot_sequence_completed");
      } catch {}
      setHasBooted(false);
      return;
    }

    // Inside authenticated app, check if boot sequence has already executed in this browser session
    try {
      const bootedSession = sessionStorage.getItem("boot_sequence_completed");
      if (bootedSession === "true") {
        setHasBooted(true);
      }
    } catch {
      // Fallback if storage is restricted
      setHasBooted(true);
    }
  }, [pathname]);

  const handleBootComplete = useCallback(() => {
    try {
      sessionStorage.setItem("boot_sequence_completed", "true");
    } catch {}
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
