import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu.tsx";

export interface MenuEntry {
  name: string;
  link: string;
}

interface Props {
  menuEntry: MenuEntry[];
}

export function Navigation({ menuEntry }: Props) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {menuEntry.map((item, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink href={item.link} className={"text-xl"}>
              {item.name}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
