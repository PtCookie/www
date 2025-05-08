import React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { translate } from "@/lib/utils.ts";
import { config, type Locale } from "@/config.ts";

interface Props {
  lang?: Locale;
}

export function ModeToggle({ lang = config.defaultLocale }: Props) {
  const [theme, setThemeState] = React.useState<"theme-light" | "dark" | "system">("theme-light");

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setThemeState(isDarkMode ? "dark" : "theme-light");
  }, []);

  React.useEffect(() => {
    const isDark =
      theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList[isDark ? "add" : "remove"]("dark");
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="noscript:hidden">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="font-sans" onClick={() => setThemeState("theme-light")}>
          {translate(lang, "component.light")}
        </DropdownMenuItem>
        <DropdownMenuItem className="font-sans" onClick={() => setThemeState("dark")}>
          {translate(lang, "component.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem className="font-sans" onClick={() => setThemeState("system")}>
          {translate(lang, "component.system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
