import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/tools/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/core/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyber: {
          dark: "#080b11",
          card: "#0d131f",
          border: "#182234",
          green: "#00e575",
          "green-glow": "rgba(0, 229, 117, 0.15)",
          amber: "#f59e0b",
          "amber-glow": "rgba(245, 158, 11, 0.15)",
          red: "#ef4444",
          muted: "#64748b",
        },
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(0, 229, 117, 0.3)",
        "glow-amber": "0 0 20px -5px rgba(245, 158, 11, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
