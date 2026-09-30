import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import BootProvider from "@/components/BootProvider";

import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "The Big Bro's NetSec Armoury",
  description:
    "A modular, professional networking and cybersecurity utility suite with an integrated AI intelligence hub.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialBooted = cookieStore.get("app_booted")?.value === "true";

  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-[#00e575]/20 selection:text-[#00e575]">
        <ThemeProvider>
          <BootProvider initialBooted={initialBooted}>{children}</BootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
