"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";
import type { School } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal school data stored in localStorage (enough to render SchoolCard) */
export type LocalSavedSchool = Pick<
  School,
  | "id"
  | "slug"
  | "name"
  | "type"
  | "area"
  | "curriculum"
  | "khda_rating"
  | "adek_rating"
  | "emirate"
  | "regulator"
  | "fee_min"
  | "fee_max"
  | "google_rating"
  | "google_review_count"
  | "google_photos"
  | "ai_summary"
  | "has_sen_support"
  | "is_featured"
> & {
  hero_photo_url?: string | null;
  subscription_plan?: string | null;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "mydscvr_saved_schools";
const MAX_LOCAL_SAVES = 3;
const SYNC_EVENT = "mydscvr-saves-changed";

// ---------------------------------------------------------------------------
// Storage helpers (try/catch for Safari private browsing)
// ---------------------------------------------------------------------------

function readStorage(): LocalSavedSchool[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(schools: LocalSavedSchool[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schools));
    // Dispatch custom event for same-tab listeners
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // localStorage unavailable (e.g. Safari private browsing) — silently fail
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // silently fail
  }
}

// ---------------------------------------------------------------------------
// External store for cross-tab + same-tab sync
// ---------------------------------------------------------------------------

let snapshot: LocalSavedSchool[] = [];

function getSnapshot(): LocalSavedSchool[] {
  return snapshot;
}

function getServerSnapshot(): LocalSavedSchool[] {
  return []; // SSR: always empty
}

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener): () => void {
  listeners.add(listener);

  // Cross-tab sync via native storage event
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      snapshot = readStorage();
      listener();
    }
  };

  // Same-tab sync via custom event
  const onCustom = () => {
    snapshot = readStorage();
    listener();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SYNC_EVENT, onCustom);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SYNC_EVENT, onCustom);
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

// Track hydration outside React to avoid setState-in-effect lint warning.
// Module-level flag is safe since hydration only needs to happen once per page load.
let hydrationDone = false;

export function useLocalSavedSchools() {
  // Hydrate on mount — reads localStorage and notifies subscribers (triggers re-render)
  useEffect(() => {
    if (!hydrationDone) {
      snapshot = readStorage();
      hydrationDone = true;
      // Notify all useSyncExternalStore subscribers → triggers re-render
      listeners.forEach((l) => l());
    }
  }, []);

  const schools = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // After hydration effect fires and notifies listeners, this component re-renders
  // and hydrationDone will be true
  const hydrated = hydrationDone;

  const addLocalSave = useCallback((school: LocalSavedSchool) => {
    const current = readStorage();
    // Already saved or at limit?
    if (current.some((s) => s.id === school.id)) return;
    if (current.length >= MAX_LOCAL_SAVES) return;
    const next = [school, ...current];
    snapshot = next;
    writeStorage(next);
  }, []);

  const removeLocalSave = useCallback((id: string) => {
    const current = readStorage();
    const next = current.filter((s) => s.id !== id);
    snapshot = next;
    writeStorage(next);
  }, []);

  const isLocalSaved = useCallback(
    (id: string) => schools.some((s) => s.id === id),
    [schools]
  );

  const clearLocalSaves = useCallback(() => {
    snapshot = [];
    clearStorage();
  }, []);

  return {
    localSavedSchools: schools,
    localSavedIds: new Set(schools.map((s) => s.id)),
    addLocalSave,
    removeLocalSave,
    isLocalSaved,
    isAtLimit: schools.length >= MAX_LOCAL_SAVES,
    localSaveCount: schools.length,
    clearLocalSaves,
    hydrated,
  };
}
