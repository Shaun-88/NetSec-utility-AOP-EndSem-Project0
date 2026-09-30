"use client";

import React, { useEffect, useState } from "react";
import BootScreen from "./BootScreen";

export default function BootProvider({ children }: { children: React.ReactNode }) {
  // Start with hasBooted false so BootScreen covers the viewport immediately from frame 0
  const [hasBooted, setHasBooted] = useState<boolean>(false);

  useEffect(() => {
    // Check if boot sequence has already executed in this browser session
    try {
      const booted = sessionStorage.getItem("boot_sequence_completed");
      if (booted === "true") {
        setHasBooted(true);
      }
    } catch {
      // Fallback if sessionStorage is disabled
      setHasBooted(true);
    }
  }, []);

  const handleBootComplete = () => {
    try {
      sessionStorage.setItem("boot_sequence_completed", "true");
    } catch {
      // ignore
    }
    setHasBooted(true);
  };

  return (
    <>
      {!hasBooted && (
        <BootScreen onComplete={handleBootComplete} minDurationMs={10000} />
      )}
      {/* Hide children completely while booting to prevent any underlying login or page flash */}
      <div className={!hasBooted ? "invisible pointer-events-none" : "visible"}>
        {children}
      </div>
    </>
  );
}
