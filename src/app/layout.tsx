import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-display" });
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
    <html lang="en" className={`dark ${inter.variable} ${orbitron.variable}`}>
      <body className="font-sans antialiased selection:bg-[#00e575]/20 selection:text-[#00e575]">
        <ThemeProvider>
          <AmbientGlow />
          <BootProvider>{children}</BootProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
