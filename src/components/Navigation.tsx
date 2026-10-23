import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu.tsx";
import { cn } from "cn";
import type { MenuEntry } from "@/config.ts";

const EMPTY_LINK_ENTRY: MenuEntry[] = [];

interface Props {
  menuEntry: MenuEntry[];
  linkEntry?: MenuEntry[];
}

export function Navigation({ menuEntry, linkEntry = EMPTY_LINK_ENTRY }: Props) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {menuEntry.map((item) => (
          <NavigationMenuItem key={item.link}>
            <NavigationMenuLink href={item.link} className={cn(navigationMenuTriggerStyle(), "font-sans sm:text-lg")}>
              {item.name}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        {linkEntry.length > 0 && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="font-sans sm:text-lg">Link</NavigationMenuTrigger>
            {/* Patina's panel is a 420px two-column grid for titled links; this menu is a short list of plain
                external links, so let the panel shrink to its content instead. */}
            <NavigationMenuContent className="w-auto min-w-40 grid-cols-1">
              {linkEntry.map((item) => (
                <NavigationMenuLink
                  key={item.link}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-sans sm:text-lg"
                >
                  {item.name}
                </NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
