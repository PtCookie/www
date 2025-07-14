import * as React from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  button?: boolean;
};

export function UnderConstruction({ className, button = false }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-8 text-center", className)}>
      <div className="text-6xl sm:text-8xl">&#x1F6A7;</div>
      <h2 className="text-4xl font-bold">Under Construction</h2>
      {button && (
        <Link href="/" className={cn(buttonVariants({ variant: "secondary" }), "p-6 text-xl sm:mt-2")}>
          Return Home
        </Link>
      )}
    </div>
  );
}
