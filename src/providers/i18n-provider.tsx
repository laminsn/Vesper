"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  dictionaries,
  type Locale,
  type TranslationKey,
} from "@/i18n";

const STORAGE_KEY = "vesper-locale";
const DEFAULT_LOCALE: Locale = "en";

function isValidLocale(value: string): value is Locale {
  return value === "en" || value === "es" || value === "pt";
}

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidLocale(stored)) return stored;
  } catch {
    // localStorage not available
  }
  return DEFAULT_LOCALE;
}

interface I18nContextValue {
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => void;
  readonly t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  readonly children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setLocaleState(getStoredLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // localStorage not available
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const dictionary = dictionaries[locale] as Record<string, string>;
      let value = dictionary[key];

      // Fallback to English if key is missing in current locale
      if (!value) {
        value = (dictionaries.en as Record<string, string>)[key];
      }

      // Return key itself as last resort
      if (!value) return key;

      // Replace interpolation variables like {count}
      if (vars) {
        return Object.entries(vars).reduce(
          (result, [varKey, varValue]) =>
            result.replace(new RegExp(`\\{${varKey}\\}`, "g"), String(varValue)),
          value
        );
      }

      return value;
    },
    [locale]
  );

  const contextValue = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
