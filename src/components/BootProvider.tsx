"use client";

import React, { useEffect, useState } from "react";
import BootScreen from "./BootScreen";

export default function BootProvider({ children }: { children: React.ReactNode }) {
  const [hasBooted, setHasBooted] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if boot sequence has already executed in this browser session
    const booted = sessionStorage.getItem("boot_sequence_completed");
    if (booted === "true") {
      setHasBooted(true);
    } else {
      setHasBooted(false);
    }
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem("boot_sequence_completed", "true");
    setHasBooted(true);
  };

  return (
    <>
      {hasBooted === false && (
        <BootScreen onComplete={handleBootComplete} minDurationMs={10000} />
      )}
      {children}
    </>
  );
}
