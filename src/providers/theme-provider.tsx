"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  readonly theme: Theme;
  readonly setTheme: (theme: Theme) => void;
  readonly toggleTheme: () => void;
}

const STORAGE_KEY = "vesper-theme";
const DEFAULT_THEME: Theme = "dark";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDocument(theme: Theme): void {
  const html = document.documentElement;
  if (theme === "light") {
    html.classList.add("light");
  } else {
    html.classList.remove("light");
  }
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (SSR, privacy mode)
  }
  return DEFAULT_THEME;
}

function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Silently ignore write failures
  }
}

export function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // Read persisted theme on mount
  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyThemeToDocument(stored);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyThemeToDocument(next);
    persistTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyThemeToDocument(next);
      persistTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
