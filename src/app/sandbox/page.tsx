import React from "react";
import SandboxScroll from "./SandboxScroll";

export const metadata = {
  title: "Training Grounds | NetSec Armoury",
  description: "Interactive cybersecurity sandbox and training environment.",
};

export default function SandboxHome() {
  return (
    <main className="w-full bg-black min-h-screen">
      <SandboxScroll />
    </main>
  );
}
