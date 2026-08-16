import * as React from "react";
import { MenuIcon, Moon, Sun } from "lucide-react";

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
  const { setTheme } = useTheme();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <MenuIcon className="size-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-xs">
        <SheetHeader>
          <SheetTitle>{translate(lang, "component.menu")}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-start gap-1.5 px-4">
          {menuEntry.map((item) => (
            <SheetClose asChild key={item.link}>
              <a href={item.link} className={buttonVariants({ variant: "ghost" })}>
                {item.name}
              </a>
            </SheetClose>
          ))}
          {linkEntry.length > 0 && (
            <>
              <div className={buttonVariants({ variant: "ghost" })}>Link</div>
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
            </>
          )}
        </div>
        <SheetFooter>
          <div className="flex items-center">
            <div className="flex items-center justify-center">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </div>
            <Button variant="ghost" onClick={() => setTheme("light")}>
              {translate(lang, "component.light")}
            </Button>
            <Button variant="ghost" onClick={() => setTheme("dark")}>
              {translate(lang, "component.dark")}
            </Button>
            <Button variant="ghost" onClick={() => setTheme("system")}>
              {translate(lang, "component.system")}
            </Button>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => switchLocale(lang, "ko", currentUrl)}>
              한글
            </Button>
            <Button variant="ghost" onClick={() => switchLocale(lang, "en", currentUrl)}>
              English
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
