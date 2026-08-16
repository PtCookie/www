import * as React from "react";
import { Moon, Sun } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useTheme } from "@/hooks/useTheme.ts";
import { translate } from "@/lib/utils.ts";
import { config, type Locale } from "@/config.ts";

interface Props {
  lang?: Locale;
}

export function ModeToggle({ lang = config.defaultLocale }: Props) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="noscript:hidden">
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="font-sans" onClick={() => setTheme("light")}>
          {translate(lang, "component.light")}
        </DropdownMenuItem>
        <DropdownMenuItem className="font-sans" onClick={() => setTheme("dark")}>
          {translate(lang, "component.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem className="font-sans" onClick={() => setTheme("system")}>
          {translate(lang, "component.system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
