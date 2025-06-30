"use client";

import * as React from "react";
import Link from "next/link";

import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function LinkDropdown() {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="font-sans sm:text-lg">Link</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink asChild>
          <Link href="https://devlog.ptcookie.net/" className="font-sans sm:text-lg">
            Blog
          </Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link href="https://git.ptcookie.net/" className="font-sans sm:text-lg">
            Git
          </Link>
        </NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
