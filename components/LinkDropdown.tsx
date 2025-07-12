"use client";

import * as React from "react";
import Link from "next/link";

import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { linkEntry } from "@/lib/menuEntry";

export function LinkDropdown() {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="font-sans sm:text-lg">Link</NavigationMenuTrigger>
      <NavigationMenuContent>
        {linkEntry.map((item, index) => (
          <NavigationMenuLink key={index} asChild>
            <Link href={item.link} className="font-sans sm:text-lg">
              {item.name}
            </Link>
          </NavigationMenuLink>
        ))}
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
