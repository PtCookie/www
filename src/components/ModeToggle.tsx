import * as React from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useTheme, type Theme } from "@/hooks/useTheme.ts";
import { translate } from "@/lib/utils.ts";
import { config, type Locale } from "@/config.ts";

interface Props {
  lang?: Locale;
}

export function ModeToggle({ lang = config.defaultLocale }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" data-js-only>
            <SunIcon
              aria-hidden="true"
              className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-[transform,opacity] dark:scale-0 dark:-rotate-90"
            />
            <MoonIcon
              aria-hidden="true"
              className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-[transform,opacity] dark:scale-100 dark:rotate-0"
            />
            <span className="sr-only">{translate(lang, "component.toggleTheme")}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {/* Radio items, not plain items: the active theme has to be announced (menuitemradio +
            aria-checked) and shown, the way Hamburger's theme buttons already do. `closeOnClick`
            is explicit because Base UI defaults it to false on RadioItem (Menu.Item defaults to
            true) — without it the menu stays open and its inert backdrop keeps swallowing the
            next click on the page. */}
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
          <DropdownMenuRadioItem className="font-sans" value="system" closeOnClick>
            {translate(lang, "component.system")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="font-sans" value="light" closeOnClick>
            {translate(lang, "component.light")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="font-sans" value="dark" closeOnClick>
            {translate(lang, "component.dark")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
