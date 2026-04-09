import { en, type TranslationKey } from "./en";
import { es } from "./es";
import { pt } from "./pt";

export type Locale = "en" | "es" | "pt";
export type { TranslationKey };

export const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en,
  es,
  pt,
} as const;

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Espa\u00f1ol",
  pt: "Portugu\u00eas",
} as const;

export const localeFlags: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  pt: "PT",
} as const;
