import * as React from "react";
import { ListIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";

import { Button, buttonVariants } from "@/components/ui/button.tsx";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";
import { useTheme } from "@/hooks/useTheme.ts";
import { switchLocale } from "@/lib/locale.ts";
import { cn, translate } from "@/lib/utils.ts";
import { config, type Locale, type MenuEntry } from "@/config.ts";

const EMPTY_LINK_ENTRY: MenuEntry[] = [];

interface Props {
  lang?: Locale;
  menuEntry: MenuEntry[];
  linkEntry?: MenuEntry[];
  currentUrl: string;
}

export function Hamburger({ lang = config.defaultLocale, menuEntry, linkEntry = EMPTY_LINK_ENTRY, currentUrl }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon">
            <ListIcon className="size-6" aria-hidden="true" />
            <span className="sr-only">Open menu</span>
          </Button>
        }
      />
      <SheetContent className="max-w-xs">
        <SheetHeader>
          <SheetTitle>{translate(lang, "component.menu")}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-start gap-1.5 px-4">
          {menuEntry.map((item) => (
            <SheetClose
              key={item.link}
              nativeButton={false}
              render={
                <a href={item.link} className={buttonVariants({ variant: "ghost" })}>
                  {item.name}
                </a>
              }
            />
          ))}
          {linkEntry.length > 0 && (
            <div role="group" aria-labelledby="sheet-links-label">
              <p id="sheet-links-label" className="text-muted-foreground px-3 text-sm font-medium">
                Link
              </p>
              {linkEntry.map((item) => (
                <a
                  key={item.link}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "ghost" }), "ml-4")}
                >
                  {item.name}
                </a>
              ))}
            </div>
          )}
        </div>
        <SheetFooter>
          <div className="flex items-center" role="group" aria-label={translate(lang, "component.themeGroup")}>
            <div className="flex items-center justify-center">
              <SunIcon
                aria-hidden="true"
                className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-[transform,opacity] dark:scale-0 dark:-rotate-90"
              />
              <MoonIcon
                aria-hidden="true"
                className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-[transform,opacity] dark:scale-100 dark:rotate-0"
              />
            </div>
            <Button variant="ghost" aria-current={theme === "system"} onClick={() => setTheme("system")}>
              {translate(lang, "component.system")}
            </Button>
            <Button variant="ghost" aria-current={theme === "light"} onClick={() => setTheme("light")}>
              {translate(lang, "component.light")}
            </Button>
            <Button variant="ghost" aria-current={theme === "dark"} onClick={() => setTheme("dark")}>
              {translate(lang, "component.dark")}
            </Button>
          </div>
          <div className="flex items-center" role="group" aria-label={translate(lang, "component.localeGroup")}>
            <Button
              variant="ghost"
              lang="ko"
              aria-current={lang === "ko"}
              onClick={() => switchLocale(lang, "ko", currentUrl)}
            >
              한글
            </Button>
            <Button
              variant="ghost"
              lang="en"
              aria-current={lang === "en"}
              onClick={() => switchLocale(lang, "en", currentUrl)}
            >
              English
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
