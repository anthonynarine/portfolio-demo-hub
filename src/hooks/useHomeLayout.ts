// # Filename: src/hooks/useHomeLayout.ts

import { useSyncExternalStore } from "react";

/*
 * The home page has two layouts: the side-scrolling "story" and the original
 * "classic" stacked page. The choice is saved like the theme is, and a link
 * can pick one with ?ui=story or ?ui=classic.
 */

export type HomeLayout = "story" | "classic";

const STORAGE_KEY = "home-layout";
const DEFAULT_LAYOUT: HomeLayout = "story";

function isLayout(value: unknown): value is HomeLayout {
  return value === "story" || value === "classic";
}

function readSaved(): HomeLayout | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLayout(saved) ? saved : null;
  } catch {
    return null;
  }
}

function save(next: HomeLayout) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage can be blocked (private windows); the choice still holds for this visit.
  }
}

// # Step 1: initial layout — a ?ui= link wins (and is remembered), then the saved choice, then the default
function getInitialLayout(): HomeLayout {
  const fromUrl = new URLSearchParams(window.location.search).get("ui");
  if (isLayout(fromUrl)) {
    save(fromUrl);
    return fromUrl;
  }
  return readSaved() ?? DEFAULT_LAYOUT;
}

// # Step 2: a tiny shared store so App and the switch (inside either layout) stay in sync
let current: HomeLayout = getInitialLayout();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setLayout(next: HomeLayout) {
  if (next === current) return;
  current = next;
  save(next);
  listeners.forEach((listener) => listener());
  // The two layouts have different heights; start the new one at its top.
  window.scrollTo({ top: 0, behavior: "instant" });
}

export function useHomeLayout() {
  return useSyncExternalStore(subscribe, () => current);
}
