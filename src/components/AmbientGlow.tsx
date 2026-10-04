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

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const render = () => {
      // Lerp (Linear Interpolation) for buttery smooth trailing
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      document.documentElement.style.setProperty("--mouse-x", `${currentX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${currentY}px`);

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    render();

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