import { create } from "zustand";

type Theme = "dark" | "light";

interface UiState {
  readonly sidebarCollapsed: boolean;
  readonly toggleSidebar: () => void;
  readonly globalSearchOpen: boolean;
  readonly setGlobalSearchOpen: (open: boolean) => void;
  readonly theme: Theme;
  readonly setTheme: (theme: Theme) => void;
  readonly toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  globalSearchOpen: false,
  setGlobalSearchOpen: (open: boolean) => set({ globalSearchOpen: open }),
  theme: "dark" as Theme,
  setTheme: (theme: Theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
}));
