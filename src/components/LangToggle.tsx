import * as React from "react";
import { TranslateIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { localePath, translate } from "@/lib/utils.ts";
import { config, type Locale } from "@/config.ts";

interface Props {
  lang?: Locale;
  currentUrl: string;
}

export function LangToggle({ lang = config.defaultLocale, currentUrl }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" data-js-only>
            <TranslateIcon aria-hidden="true" className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">{translate(lang, "component.toggleLocale")}</span>
          </Button>
        }
      />
      {/* Rendered as real <a href> elements, not onClick handlers, so Cmd/Ctrl-click, middle-click
          and "copy link address" all work. BaseLayout's <ClientRouter /> intercepts same-origin
          anchor clicks itself, so client-side navigation still happens on a plain click. */}
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          nativeButton={false}
          className="font-sans"
          render={
            <a lang="ko" href={localePath(lang, "ko", currentUrl)} aria-current={lang === "ko" ? "true" : undefined}>
              한글
            </a>
          }
        />
        <DropdownMenuItem
          nativeButton={false}
          className="font-sans"
          render={
            <a lang="en" href={localePath(lang, "en", currentUrl)} aria-current={lang === "en" ? "true" : undefined}>
              English
            </a>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
