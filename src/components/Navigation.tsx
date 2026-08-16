import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu.tsx";
import type { MenuEntry } from "@/config.ts";

interface Props {
  menuEntry: MenuEntry[];
}

export function Navigation({ menuEntry }: Props) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {menuEntry.map((item) => (
          <NavigationMenuItem key={item.link}>
            <NavigationMenuLink href={item.link} className={"font-sans text-base sm:text-lg"}>
              {item.name}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
