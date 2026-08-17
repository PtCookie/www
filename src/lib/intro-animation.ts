import type { gsap as GSAP } from "gsap";

export interface IntroTargets {
  coin: GSAP.TweenTarget;
  chars: GSAP.TweenTarget;
}

/** Builds the looping coin-flip + character-bounce timeline. */
export function buildIntroTimeline(gsap: typeof GSAP, targets: IntroTargets): GSAP.core.Timeline {
  const mainTimeline = gsap.timeline({ repeat: -1, repeatDelay: 1 });

  const flipTimeline = gsap.timeline();
  const typingTimeline = gsap.timeline();

  mainTimeline.add([flipTimeline, typingTimeline], 0);

  flipTimeline
    .set(targets.coin, { rotationY: 0 })
    .to(targets.coin, { rotationY: 180, duration: 1.75, ease: "power2.in" })
    .to(targets.coin, { rotationY: 360, duration: 1.25, ease: "power2.out" });

  typingTimeline.to(targets.chars, {
    y: -30,
    ease: "power2.out",
    stagger: {
      each: 0.15,
      repeat: 1,
      yoyo: true,
      easeReverse: "bounce.out",
    },
  });

  return mainTimeline;
}
