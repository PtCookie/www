"use client";

import * as React from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function Intro() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const coinRef = React.useRef<HTMLDivElement>(null);

  const text = "PtCookie.Net";

  useGSAP(
    () => {
      const mainTimeline = gsap.timeline({ repeat: -1 });

      const flipTimeline = gsap.timeline();
      const TypingTimeline = gsap.timeline();

      mainTimeline.add([flipTimeline, TypingTimeline], 0);

      flipTimeline
        .set(coinRef.current, { rotationY: 0 })
        .to(coinRef.current, {
          rotationY: 180,
          duration: 1.75,
          ease: "power2.in",
        })
        .to(coinRef.current, {
          rotationY: 360,
          duration: 1.25,
          ease: "power2.out",
        });

      TypingTimeline.to(".char", {
        y: -30,
        ease: "power2.out",
        stagger: {
          each: 0.15,
          repeat: 1,
        },
        yoyo: true,
        yoyoEase: "bounce.out",
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center gap-16">
      <div ref={coinRef} className="h-48 w-48 origin-center transform-3d sm:h-64 sm:w-64">
        <Image
          src="/ptcookie.svg"
          alt="PtCookie"
          width={256}
          height={256}
          priority
          className="rounded-full shadow-2xl"
        />
      </div>
      <div className="font-mono text-4xl font-bold drop-shadow-lg text-shadow-lg sm:text-6xl">
        {text.split("").map((char, index) => (
          <span key={index} className="char inline-block">
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
