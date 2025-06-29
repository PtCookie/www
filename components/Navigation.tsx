import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export function Navigation() {
  interface MenuEntry {
    name: string;
    link: string;
  }

  const menuEntry: MenuEntry[] = [
    { name: "Home", link: "/" },
    { name: "About", link: "/about" },
  ];

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
