import React, { createContext, useContext, useEffect, useState } from "react";
import { THEMES, type ThemeType } from "@/constants/app-constants";

interface ThemeContextValue {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  resolvedTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES.DARK,
  setTheme: () => {},
  resolvedTheme: "dark",
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem("nuvex_theme");
    return (saved as ThemeType) || THEMES.DARK;
  });

  const resolvedTheme: "dark" | "light" =
    theme === THEMES.SYSTEM
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : (theme as "dark" | "light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(resolvedTheme);
    localStorage.setItem("nuvex_theme", theme);
  }, [theme, resolvedTheme]);

  useEffect(() => {
    if (theme !== THEMES.SYSTEM) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setThemeState(THEMES.SYSTEM); // trigger re-render
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (t: ThemeType) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
