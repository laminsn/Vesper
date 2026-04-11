"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, User, Settings, LogOut, Mic } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { VoiceModeButton } from "@/components/layout/voice-mode";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";

export function Topbar() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const setGlobalSearchOpen = useUiStore((s) => s.setGlobalSearchOpen);
  const voiceModeEnabled = useUiStore((s) => s.voiceModeEnabled);
  const toggleVoiceMode = useUiStore((s) => s.toggleVoiceMode);
  const { t } = useI18n();

  const handleSearchOpen = useCallback(() => {
    setGlobalSearchOpen(true);
  }, [setGlobalSearchOpen]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push("/login");
  }, [signOut, router]);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleSearchOpen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSearchOpen]);

  const displayName = user?.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-[var(--jarvis-border)] bg-[var(--jarvis-bg-primary)]/80 px-6 backdrop-blur-md">
      {/* Left: page title area */}
      <div className="flex items-center gap-2">
        <span className="heading-display text-sm text-[var(--jarvis-text-primary)]">
          Vesper
        </span>
      </div>

      {/* Center: search trigger */}
      <button
        onClick={handleSearchOpen}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-3 py-1.5 text-sm text-[var(--jarvis-text-muted)] transition-colors",
          "hover:border-[var(--jarvis-border-strong)] hover:text-[var(--jarvis-text-secondary)]"
        )}
      >
        <Search className="h-3.5 w-3.5" />
        <span>{t("common.search")}</span>
        <kbd className="ml-4 rounded border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--jarvis-text-muted)]">
          {"\u2318"}K
        </kbd>
      </button>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Voice Mode */}
        <VoiceModeButton
          enabled={voiceModeEnabled}
          onTranscript={(text) => {
            // Global voice command — route to Command Station
            toast.info(`Voice: "${text}"`, { description: "Navigate to Command Station to issue voice directives" });
          }}
        />
        <button
          onClick={toggleVoiceMode}
          className={`rounded-lg p-2 text-[var(--jarvis-text-muted)] transition-colors hover:bg-[var(--jarvis-bg-tertiary)] ${voiceModeEnabled ? "text-red-400" : ""}`}
          title={voiceModeEnabled ? "Disable Voice Mode" : "Enable Voice Mode"}
        >
          <Mic className="h-4 w-4" />
        </button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <button
          className="relative rounded-lg p-2 text-[var(--jarvis-text-muted)] transition-colors hover:bg-[var(--jarvis-bg-tertiary)] hover:text-[var(--jarvis-text-primary)]"
          aria-label={t("common.notifications")}
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User avatar dropdown */}
        <div className="group relative">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] text-xs font-medium text-[var(--jarvis-accent)] transition-colors hover:border-[var(--jarvis-accent)]"
            aria-label="User menu"
          >
            {initials}
          </button>

          {/* Dropdown */}
          <div className="invisible absolute right-0 top-full mt-2 w-48 rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
            <div className="border-b border-[var(--jarvis-border)] px-3 py-2">
              <p className="truncate text-sm font-medium text-[var(--jarvis-text-primary)]">
                {displayName}
              </p>
              <p className="truncate text-xs text-[var(--jarvis-text-muted)]">
                {user?.email}
              </p>
            </div>
            <a
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--jarvis-text-secondary)] transition-colors hover:bg-[var(--jarvis-bg-tertiary)] hover:text-[var(--jarvis-text-primary)]"
            >
              <User className="h-3.5 w-3.5" />
              {t("common.profile")}
            </a>
            <a
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--jarvis-text-secondary)] transition-colors hover:bg-[var(--jarvis-bg-tertiary)] hover:text-[var(--jarvis-text-primary)]"
            >
              <Settings className="h-3.5 w-3.5" />
              {t("nav.settings")}
            </a>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--jarvis-danger)] transition-colors hover:bg-[var(--jarvis-bg-tertiary)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t("common.signOut")}
            </button>
          </div>
        </div>
      </div>

      {/* Glow line at bottom */}
      <div className="glow-line absolute bottom-0 left-0 right-0" />
    </header>
  );
}
