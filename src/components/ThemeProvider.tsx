"use client";

import React, { createContext, useContext, useEffect } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    try {
      localStorage.setItem("theme", "dark");
    } catch {}
  }, []);

  const setTheme = () => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  };

  const toggleTheme = () => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  };

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
