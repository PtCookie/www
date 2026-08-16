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
import { cn } from "@/lib/utils.ts";
import type { MenuEntry } from "@/config.ts";

const EMPTY_LINK_ENTRY: MenuEntry[] = [];

interface Props {
  menuEntry: MenuEntry[];
  linkEntry?: MenuEntry[];
}

export function Navigation({ menuEntry, linkEntry = EMPTY_LINK_ENTRY }: Props) {
  return (
    <NavigationMenu viewport={false}>
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
            <NavigationMenuContent>
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
