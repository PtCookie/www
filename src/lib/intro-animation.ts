import type { gsap as GSAP } from "gsap";

// gsap's type members live in a *global* `gsap` namespace; the package's own `gsap` export is a
// `const` typed `typeof gsap`, which carries a value meaning only — so `GSAP.TweenTarget` is not a
// namespace access and doesn't compile. Alias what's needed here at module scope, where the `gsap`
// parameter below doesn't shadow the global. The import stays: it's what loads gsap's types.
type TweenTarget = gsap.TweenTarget;
type Timeline = gsap.core.Timeline;

export interface IntroTargets {
  coin: TweenTarget;
  chars: TweenTarget;
}

/**
 * Builds the one-shot coin-flip + character-bounce entrance timeline.
 *
 * Deliberately not looping. An indefinitely repeating hero animation is autoplaying motion that
 * runs past five seconds with no way to pause, stop or hide it, which WCAG 2.2.2 forbids — and
 * the `prefers-reduced-motion` early-return in Intro.astro addresses a different audience, so it
 * does not satisfy that criterion. Playing the entrance once and stopping meets it without adding
 * a decorative play/pause control to the hero. The per-character `repeat: 1` stagger below is
 * finite and unaffected.
 */
export function buildIntroTimeline(gsap: typeof GSAP, targets: IntroTargets): Timeline {
  const mainTimeline = gsap.timeline();

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
