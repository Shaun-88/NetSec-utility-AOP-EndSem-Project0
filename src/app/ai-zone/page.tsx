import React from "react";
import AppShell from "@/components/AppShell";
import AiZoneChatView from "./AiZoneChatView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Zone | The Big Bro's NetSec Armoury",
  description: "Interactive cybersecurity mentor and network defense assistant powered by Google Gemini.",
};

export default function AiZonePage() {
  return (
    <AppShell>
      <AiZoneChatView />
    </AppShell>
  );
}
