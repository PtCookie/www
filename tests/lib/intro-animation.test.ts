import { describe, expect, test } from "vitest";
import { gsap } from "gsap";
import { buildIntroTimeline } from "@/lib/intro-animation.ts";

describe("buildIntroTimeline", () => {
  test("configures main timeline loop settings and duration", () => {
    const coin = { rotationY: 0 };
    const chars = Array.from({ length: 12 }, () => ({ y: 0 }));

    const tl = buildIntroTimeline(gsap, { coin, chars });

    expect(tl.repeat()).toBe(-1);
    expect(tl.repeatDelay()).toBe(1);
    expect(tl.duration()).toBe(3);
  });

  test("animates coin rotation from 0 to 360 over 3 seconds", () => {
    const coin = { rotationY: 0 };
    const chars = Array.from({ length: 12 }, () => ({ y: 0 }));

    const tl = buildIntroTimeline(gsap, { coin, chars });
    tl.pause();

    tl.time(0);
    expect(coin.rotationY).toBe(0);

    tl.time(1.75);
    expect(coin.rotationY).toBeCloseTo(180, 1);

    tl.time(3);
    expect(coin.rotationY).toBeCloseTo(360, 1);
  });

  test("yoyo bounces characters back to resting y=0 position", () => {
    const coin = { rotationY: 0 };
    const chars = Array.from({ length: 12 }, () => ({ y: 0 }));

    const tl = buildIntroTimeline(gsap, { coin, chars });
    tl.pause();

    tl.time(0);
    for (const char of chars) {
      expect(char.y).toBe(0);
    }

    // Mid-tween: characters rise towards -30
    tl.time(0.5);
    expect(chars[0].y).toBeCloseTo(-30, 0);

    // End of typing tween: all characters bounce back to y=0
    tl.time(2.65);
    for (const char of chars) {
      expect(char.y).toBeCloseTo(0, 1);
    }

    // End of main cycle: characters remain at resting y=0
    tl.time(3);
    for (const char of chars) {
      expect(char.y).toBeCloseTo(0, 1);
    }
  });
});
