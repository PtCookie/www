import * as React from "react";

import { Timeline } from "@/components/Timeline";
import { UnderConstruction } from "@/components/UnderConstruction";

export default function Work() {
  return (
    <div className="flex grow flex-col items-center justify-items-center">
      <Timeline />
      <h2 className="mb-8 text-center font-sans text-3xl font-bold">Hobby Projects</h2>
      <UnderConstruction className="py-32" />
    </div>
  );
}
