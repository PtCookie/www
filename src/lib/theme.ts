// Owns the theme store: `<html data-theme>` holds the stored preference
// (`system` | `light` | `dark`), `<html class="dark">` holds the resolved value CSS keys off.
// This module is the source of truth `useTheme.ts` wraps via `useSyncExternalStore` — the DOM
// *is* the store, so islands never fall out of sync with each other or with a ClientRouter swap.
//
// Kept out of `utils.ts` for the same reason as `locale.ts`: it's browser-only (reads
// `document`/`localStorage`/`matchMedia` at call time) and `tests/lib/utils.test.ts` runs in the
// node-environment `unit` vitest project.
//
// The resolve expression here (`pref === "dark" || (pref === "system" && matchMedia(...).matches)`)
// is intentionally duplicated in BaseLayout.astro's inline head script rather than shared — that
// script must stay import-free plain JS to qualify for `is:inline` (see the comment there), so
// there's nothing for this module to be imported into before first paint.

export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

// Keep in sync with the --background token values in src/styles/global.css.
const THEME_COLOR = { light: "oklch(1 0 0)", dark: "oklch(0.148 0.004 228.8)" };

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "system" || value === "light" || value === "dark";
}

export function readTheme(): Theme {
  if (typeof document === "undefined") {
    return "system";
  }
  const stored = document.documentElement.dataset.theme;
  return isTheme(stored) ? stored : "system";
}

function syncThemeColorMeta(isDark: boolean): void {
  document.getElementById("theme-color-meta")?.setAttribute("content", isDark ? THEME_COLOR.dark : THEME_COLOR.light);
}

export function applyTheme(theme: Theme): void {
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia(DARK_MEDIA_QUERY).matches);
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", isDark);
  syncThemeColorMeta(isDark);
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage disabled (private mode, some embedded webviews) — the choice still applies
    // for this page view, it just won't survive a reload.
  }
}

// Keeps every subscriber (ModeToggle, Hamburger, ...) reactive to changes this module didn't
// cause itself: the OS-level scheme flipping while "system" is selected, and another tab
// changing the stored preference. Both listeners are shared across all subscribers and torn
// down once the last one unsubscribes.
let listenerCount = 0;
let media: MediaQueryList | undefined;

function handleMediaChange(): void {
  if (readTheme() === "system") {
    applyTheme("system");
  }
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== THEME_STORAGE_KEY) {
    return;
  }
  applyTheme(isTheme(event.newValue) ? event.newValue : "system");
}

export function subscribeTheme(listener: () => void): () => void {
  if (listenerCount === 0) {
    media = window.matchMedia(DARK_MEDIA_QUERY);
    media.addEventListener("change", handleMediaChange);
    window.addEventListener("storage", handleStorage);
  }
  listenerCount += 1;

  // React's useSyncExternalStore contract: this callback only needs to tell React to re-read
  // the snapshot. The dark-class mutation itself is observed via the same DOM attribute this
  // subscription is watching, so re-registering a MutationObserver per subscriber is unnecessary
  // — a single shared one keyed off `data-theme` changes covers every consumer.
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  return () => {
    observer.disconnect();
    listenerCount -= 1;
    if (listenerCount === 0 && media) {
      media.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorage);
      media = undefined;
    }
  };
}
