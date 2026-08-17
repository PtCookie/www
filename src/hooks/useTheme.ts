import * as React from "react";

import { readTheme, setTheme as setThemeStore, subscribeTheme, type Theme } from "@/lib/theme.ts";

export type { Theme };

// Thin `useSyncExternalStore` wrapper around src/lib/theme.ts. `<html data-theme>` (via
// readTheme/subscribeTheme) is the actual store, so every consumer of this hook (ModeToggle,
// Hamburger) stays in sync with each other and with BaseLayout.astro's inline head script — no
// island re-asserts a stale value on mount or on an astro:after-swap navigation.
export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void } {
  const theme = React.useSyncExternalStore(subscribeTheme, readTheme, () => "system" as Theme);
  return { theme, setTheme: setThemeStore };
}
