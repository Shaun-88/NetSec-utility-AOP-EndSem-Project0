"use client";

import React, { useEffect, useState, useCallback } from "react";
import BootScreen from "./BootScreen";
import { playSound } from "@/utils/audio";

export default function BootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasBooted, setHasBooted] = useState<boolean>(false);
  const [isMounting, setIsMounting] = useState<boolean>(true);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a") || target.closest("[role='button']")) {
        playSound("click");
      }
    };
    
    // Use mousedown for faster perceived response
    document.addEventListener("mousedown", handleGlobalClick);
    return () => document.removeEventListener("mousedown", handleGlobalClick);
  }, []);

  useEffect(() => {
    // Check if this is a hard reload
    let isReload = false;
    if (typeof performance !== "undefined") {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries.length > 0) {
        const navEntry = navEntries[0] as PerformanceNavigationTiming;
        if (navEntry.type === "reload") {
          isReload = true;
        }
      }
    }

    if (isReload) {
      try {
        sessionStorage.removeItem("boot_sequence_completed");
      } catch {}
      setHasBooted(false);
      setIsMounting(false);
      return;
    }

    try {
      const bootedSession = sessionStorage.getItem("boot_sequence_completed");
      if (bootedSession === "true") {
        setHasBooted(true);
      } else {
        setHasBooted(false);
      }
    } catch {
      setHasBooted(true);
    }
    
    setIsMounting(false);
  }, []); // Run only on initial mount to avoid resetting during client navigation

  const handleBootComplete = useCallback(() => {
    try {
      sessionStorage.setItem("boot_sequence_completed", "true");
    } catch {}
    setHasBooted(true);
  }, []);

  if (isMounting) {
    return <div className="fixed inset-0 z-[10000] bg-[#070a10]" />;
  }

  return (
    <>
      {!hasBooted && (
        <BootScreen onComplete={handleBootComplete} minDurationMs={10000} />
      )}
      {children}
    </>
  );
}
