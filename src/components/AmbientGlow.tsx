"use client";

import { useEffect, useState } from "react";

export function AmbientGlow() {
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    let currentX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    let currentY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
    let targetX = currentX;
    let targetY = currentY;
    let animationFrameId: number;

    let isRunning = false;

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      startLoop();
    };

    const render = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;

      // Lerp (Linear Interpolation) for buttery smooth trailing
      currentX += dx * 0.12;
      currentY += dy * 0.12;

      document.documentElement.style.setProperty("--mouse-x", `${currentX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${currentY}px`);

      // If at rest, sleep RAF loop until next mouse move to eliminate idle CPU drain
      if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
        isRunning = false;
        return;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    startLoop();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Create a unique ping
      const newClick = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY };
      setClicks((prev) => [...prev, newClick]);
      
      // Cleanup the ping after animation completes (450ms now)
      setTimeout(() => {
        setClicks((prev) => prev.filter((c) => c.id !== newClick.id));
      }, 450);
    };

    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    return () => window.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <>
      <div className="ambient-glow-overlay" />
      {clicks.map((click) => (
        <div
          key={click.id}
          className="fixed pointer-events-none z-[10000] rounded-full border border-[#00e575] animate-sonar-click"
          style={{
            left: click.x - 20,
            top: click.y - 20,
            width: 40,
            height: 40,
          }}
        />
      ))}
    </>
  );
}