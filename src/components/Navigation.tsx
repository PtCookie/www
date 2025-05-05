import React from "react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu.tsx";
import type { MenuEntry } from "@/config";

interface Props {
  menuEntry: Array<MenuEntry>;
}

export function Navigation({ menuEntry }: Props) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {menuEntry.map((item, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink href={item.link} className={"font-sans text-base sm:text-lg"}>
              {item.name}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
