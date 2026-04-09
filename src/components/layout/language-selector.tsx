"use client";

import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/providers/i18n-provider";
import { localeNames, localeFlags, type Locale } from "@/i18n";

const LOCALE_OPTIONS: readonly Locale[] = ["en", "es", "pt"] as const;

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger className="h-8 w-[130px] gap-1.5 border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] text-xs text-[var(--jarvis-text-secondary)]">
        <Globe className="h-3.5 w-3.5 shrink-0 text-[var(--jarvis-text-muted)]" />
        <SelectValue>
          {localeFlags[locale]} {localeNames[locale]}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LOCALE_OPTIONS.map((loc) => (
          <SelectItem key={loc} value={loc} className="text-xs">
            {localeFlags[loc]} {localeNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
