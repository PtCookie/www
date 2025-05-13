import * as React from "react";
import { ModeToggle } from "./ModeToggle";
import packageJson from "@/package.json";

export function Header() {
  return (
    <header className="mx-auto my-1.5 flex w-full justify-between border-b-2 px-8 py-2 sm:my-6 sm:py-4">
      <div className="flex items-center">
        <a className="font-serif text-xl font-bold sm:text-3xl sm:leading-tight">{packageJson.name}</a>
      </div>
      <div className="flex items-center">
        <ModeToggle />
      </div>
    </header>
  );
}
