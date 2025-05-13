import * as React from "react";
import packageJson from "@/package.json";

export function Footer() {
  return (
    <footer className="text-muted-foreground mx-auto my-6 flex w-full flex-col gap-4 border-t-2 py-4 text-center font-sans text-sm sm:py-6 sm:text-lg">
      <p>
        &copy; {new Date().getFullYear()}, {packageJson.author.name}
      </p>
    </footer>
  );
}
