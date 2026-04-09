import { create } from "zustand";

// ═══════════════════════════════════════════════════
// Organization Context Store
// ═══════════════════════════════════════════════════
// Persists the active organization to localStorage so it
// survives page reloads. All data queries filter by this org.

const STORAGE_KEY = "vesper-org-id";

interface StoredOrg {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly hipaaMode: boolean;
}

function loadFromStorage(): StoredOrg | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "id" in parsed &&
      "name" in parsed &&
      "slug" in parsed &&
      "hipaaMode" in parsed
    ) {
      return parsed as StoredOrg;
    }
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(org: StoredOrg): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(org));
  } catch {
    // localStorage unavailable (SSR or quota exceeded) — silently skip.
  }
}

function clearStorage(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Silently skip if unavailable.
  }
}

interface OrgState {
  readonly currentOrgId: string | null;
  readonly currentOrgName: string | null;
  readonly currentOrgSlug: string | null;
  readonly hipaaMode: boolean;
  readonly setCurrentOrg: (
    id: string,
    name: string,
    slug: string,
    hipaaMode: boolean,
  ) => void;
  readonly clearOrg: () => void;
}

const stored = loadFromStorage();

export const useOrgStore = create<OrgState>((set) => ({
  currentOrgId: stored?.id ?? null,
  currentOrgName: stored?.name ?? null,
  currentOrgSlug: stored?.slug ?? null,
  hipaaMode: stored?.hipaaMode ?? false,

  setCurrentOrg: (
    id: string,
    name: string,
    slug: string,
    hipaaMode: boolean,
  ) => {
    const org: StoredOrg = { id, name, slug, hipaaMode };
    saveToStorage(org);
    set({
      currentOrgId: id,
      currentOrgName: name,
      currentOrgSlug: slug,
      hipaaMode,
    });
  },

  clearOrg: () => {
    clearStorage();
    set({
      currentOrgId: null,
      currentOrgName: null,
      currentOrgSlug: null,
      hipaaMode: false,
    });
  },
}));
