import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import BootProvider from "@/components/BootProvider";
import { AmbientGlow } from "@/components/AmbientGlow";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "The Big Bro's NetSec Armoury",
  description:
    "A modular, professional networking and cybersecurity utility suite with an integrated AI intelligence hub.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-[#00e575]/20 selection:text-[#00e575]">
        <ThemeProvider>
          <AmbientGlow />
          <BootProvider>{children}</BootProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
