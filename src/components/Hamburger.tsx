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
import { localePath, translate } from "@/lib/utils.ts";
import { cn } from "cn";
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
            <span className="sr-only">{translate(lang, "component.openMenu")}</span>
          </Button>
        }
      />
      <SheetContent className="max-w-xs" closeLabel={translate(lang, "component.close")}>
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
            {/* aria-pressed, not aria-current: these three are a toggle set, not a set of links
                where one is the current destination. The locale buttons below stay on
                aria-current, which really does mark the page's current language. */}
            <Button variant="ghost" aria-pressed={theme === "system"} onClick={() => setTheme("system")}>
              {translate(lang, "component.system")}
            </Button>
            <Button variant="ghost" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>
              {translate(lang, "component.light")}
            </Button>
            <Button variant="ghost" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>
              {translate(lang, "component.dark")}
            </Button>
          </div>
          {/* Real <a href> elements (wrapped in SheetClose, same pattern as the menuEntry links
              above), not onClick handlers, so Cmd/Ctrl-click, middle-click and "copy link
              address" all work. */}
          <div className="flex items-center" role="group" aria-label={translate(lang, "component.localeGroup")}>
            <SheetClose
              nativeButton={false}
              render={
                <a
                  href={localePath(lang, "ko", currentUrl)}
                  lang="ko"
                  aria-current={lang === "ko"}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  한글
                </a>
              }
            />
            <SheetClose
              nativeButton={false}
              render={
                <a
                  href={localePath(lang, "en", currentUrl)}
                  lang="en"
                  aria-current={lang === "en"}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  English
                </a>
              }
            />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
