"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { MenuIcon, Moon, Sun } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { linkEntry, menuEntry } from "@/lib/lists";
import { cn } from "@/lib/utils";

export function Hamburger() {
  const { setTheme } = useTheme();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <MenuIcon className="size-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-xs">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-start gap-1.5 px-4">
          {menuEntry.map((item, index) => (
            <Link key={index} href={item.link} className={buttonVariants({ variant: "ghost" })}>
              {item.name}
            </Link>
          ))}
          <div className={buttonVariants({ variant: "ghost" })}>Link</div>
          {linkEntry.map((item, index) => (
            <Link key={index} href={item.link} className={cn(buttonVariants({ variant: "ghost" }), "ml-4")}>
              {item.name}
            </Link>
          ))}
        </div>
        <SheetFooter>
          <div className="flex items-center">
            <div className="flex items-center justify-center">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </div>
            <Button variant="ghost" onClick={() => setTheme("light")}>
              Light
            </Button>
            <Button variant="ghost" onClick={() => setTheme("dark")}>
              Dark
            </Button>
            <Button variant="ghost" onClick={() => setTheme("system")}>
              System
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
