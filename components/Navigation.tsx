import * as React from "react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { LinkDropdown } from "@/components/LinkDropdown";
import { cn } from "@/lib/utils";

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
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {menuEntry.map((item, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "font-sans sm:text-lg")}>
              <Link href={item.link}>{item.name}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        <LinkDropdown />
      </NavigationMenuList>
    </NavigationMenu>
  );
}
