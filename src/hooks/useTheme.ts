import * as React from "react";

export type Theme = "light" | "dark" | "system";

// Owns the `dark` class toggle on `<html>`. Not next-themes — this project doesn't use it.
// Header.astro's inline script (FOUC-free init + MutationObserver) persists whatever this
// hook writes to `localStorage`, so any consumer that flips the class stays in sync for free.
export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void } {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof document === "undefined") {
      return "system";
    }
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  React.useEffect(() => {
    const isDark =
      theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList[isDark ? "add" : "remove"]("dark");
  }, [theme]);

  return { theme, setTheme };
}
