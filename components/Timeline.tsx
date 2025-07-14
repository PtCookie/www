"use client";

import * as React from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { Separator } from "@/components/ui/separator";
import { timelineData } from "@/lib/lists";

gsap.registerPlugin(useGSAP);

export function Timeline() {
  useGSAP(() => {
    // Initialize animation elements
    gsap.set(".timeline-card", {
      x: 300,
      opacity: 0,
    });
    gsap.set(".timeline-point", {
      opacity: 0,
      scale: 0,
    });

    const mainTimeline = gsap.timeline();

    const cardTimeline = gsap.timeline();
    const pointTimeline = gsap.timeline();

    mainTimeline.add([cardTimeline, pointTimeline], 0);

    cardTimeline.to(`.timeline-card`, {
      x: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      stagger: {
        each: 0.2,
      },
    });
    pointTimeline.to(`.timeline-point`, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "back.out(1.7)",
      stagger: {
        each: 0.2,
      },
    });
  });

  return (
    <div className="mx-auto max-w-4xl min-w-3/5 px-4 py-8">
      <h2 className="mb-8 text-center font-sans text-3xl font-bold">Professional Experience</h2>
      <div className="relative pl-8">
        <Separator orientation="vertical" className="absolute top-0 left-4 w-0.5!" />
        {timelineData.map((item, index) => (
          <div key={index} className="mb-12 flex items-center">
            <div className="timeline-point border-background bg-chart-5 z-10 ml-4 h-4 w-4 -translate-x-1/2 transform rounded-full border-4 shadow-md">
              {/* Point dot */}
            </div>
            <div className="flex-1 font-sans">
              <div className="timeline-card bg-card rounded-lg border p-6 shadow-lg">
                <div className="text-chart-4 mb-2 text-sm font-semibold">{item.period}</div>
                <h3 className="text-primary mb-2 text-xl font-bold">{item.title}</h3>
                <p className="text-secondary-foreground mb-4 font-serif">{item.description}</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {item.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="bg-sidebar-accent text-sidebar-accent-foreground rounded-full px-3 py-1 font-mono text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                {item.details && item.details.length > 0 && (
                  <ul className="text-primary space-y-1 text-sm">
                    {item.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start">
                        <span className="text-chart-5 mr-2">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
