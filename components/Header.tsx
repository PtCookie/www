import * as React from "react";
import Link from "next/link";

import { Navigation } from "@/components/Navigation";
import { ModeToggle } from "@/components/ModeToggle";
import packageJson from "@/package.json";

export function Header() {
  return (
    <header className="mx-auto my-1.5 flex w-full justify-center border-b-2 px-8 py-2 sm:my-6 sm:py-4">
      <div className="flex w-full max-w-3xl items-center justify-between gap-4 sm:max-w-5xl">
        <div className="flex items-center">
          <Link href="/" className="font-serif text-xl font-bold sm:text-3xl sm:leading-tight">
            {packageJson.name}
          </Link>
        </div>
        <div className="flex items-center">
          <Navigation />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
