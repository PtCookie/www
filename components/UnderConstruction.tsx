import * as React from "react";
import Link from "next/link";

export function UnderConstruction() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center">
      <div className="text-6xl sm:text-8xl">&#x1F6A7;</div>
      <h2 className="text-4xl font-bold">Under Construction</h2>
      <Link href="/" className="underline">
        Return Home
      </Link>
    </div>
  );
}
