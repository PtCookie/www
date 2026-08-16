import * as React from "react";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { switchLocale } from "@/lib/locale.ts";
import { config, type Locale } from "@/config.ts";

interface Props {
  lang?: Locale;
  currentUrl: string;
}

export function LangToggle({ lang = config.defaultLocale, currentUrl }: Props) {
  async function handleClick(targetLocale: Locale) {
    await switchLocale(lang, targetLocale, currentUrl);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="noscript:hidden">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle Locale</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="font-sans" onClick={() => handleClick("ko")}>
          한글
        </DropdownMenuItem>
        <DropdownMenuItem className="font-sans" onClick={() => handleClick("en")}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
