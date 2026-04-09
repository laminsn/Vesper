"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative rounded-lg p-2 text-[var(--jarvis-text-muted)] transition-colors hover:bg-[var(--jarvis-bg-tertiary)] hover:text-[var(--jarvis-text-primary)]"
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      <span className="relative block h-4 w-4">
        {/* Sun icon — visible in dark mode */}
        <Sun
          className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
        />
        {/* Moon icon — visible in light mode */}
        <Moon
          className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
