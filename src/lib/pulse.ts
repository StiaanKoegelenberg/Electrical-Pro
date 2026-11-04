import { useEffect, type RefObject } from "react";

// The electrical pulse that runs along a chain of bordered items joined by short wires: a streak of light
// traces round each item's border, then runs along the wire to the next item, lighting the dot at each
// end as it passes. Used by the stats strip (Stats.tsx) and the project figures (Projects.tsx); the
// elements it animates are PulseLayers and Dot in components/site/PulseParts.tsx.

// Solid (not translucent) greys, so lines meeting under a dot don't show through or double up
export const LINE_GREY = "hsl(214 14% 25%)";
export const DOT_GREY = "hsl(214 9% 38%)";

// Pulse timing in seconds
const DOT_PEAK = 0.1; // a connector dot is brightest this long after its animation starts
const DOT_END = 0.4; // ...and back to grey by here
const RUN_FADE = 0.05; // connector pulse fades in/out over this at each end

export interface PulseTimeline {
  cardTime: number;
  cardStarts: number[];
  links: number[];
  linkStarts: number[];
  cycle: number;
}

// When each piece fires: round item 0, along link 0, round item 1 and so on (a link with no wire drawn
// for it is just a pause). A new pulse starts either when the previous one is halfway round item
// `restartAt`, so the tail of each pulse overlaps the next one's start, or `rest` seconds after the
// previous one leaves the last item.
export const chainTimeline = (
  cardTime: number,
  links: number[],
  next: { restartAt: number } | { rest: number },
): PulseTimeline => {
  const cardStarts = [0];
  const linkStarts: number[] = [];
  for (let i = 0; i < links.length; i++) {
    linkStarts.push(cardStarts[i] + cardTime);
    cardStarts.push(linkStarts[i] + links[i]);
  }
  const cycle =
    "rest" in next ? cardStarts[cardStarts.length - 1] + cardTime + next.rest : cardStarts[next.restartAt] + cardTime / 2;
  return { cardTime, cardStarts, links, linkStarts, cycle };
};

const traceFrames = (win: number, dash: number): Keyframe[] => [
  { strokeDashoffset: `${dash + 0.02}`, offset: 0 },
  { strokeDashoffset: "-1.02", offset: win },
  { strokeDashoffset: "-1.02", offset: 1 },
];

// How far through its run (0 to 1) a streak has just passed the point `at` (0 to 1) of the way along its
// path. It sets off 0.02 before the path's start and runs until 0.02 past its end, as in traceFrames.
export const streakPassed = (at: number, dash: number) => (at + dash + 0.02) / (dash + 1.04);

// The streak sliding through a wire's track: across (X) or down (Y)
const runFrames = (win: number, fade: number, axis: "X" | "Y"): Keyframe[] => {
  const at = (o: number) => `translate${axis}(${-100 + 200 * (o / win)}%)`;
  return [
    { transform: at(0), opacity: 0, offset: 0 },
    { transform: at(fade), opacity: 1, offset: fade },
    { transform: at(win - fade), opacity: 1, offset: win - fade },
    { transform: at(win), opacity: 0, offset: win },
    { transform: at(win), opacity: 0, offset: 1 },
  ];
};

const IDLE_DOT = { backgroundColor: DOT_GREY, transform: "scale(1)", boxShadow: "0 0 0 0 transparent, 0 0 0 0 transparent" };
const LIT_DOT = { backgroundColor: "hsl(200 100% 90%)", transform: "scale(1.7)", boxShadow: "0 0 4px 1px hsl(200 100% 60%), 0 0 14px 4px hsl(200 100% 60% / 0.6)" };
const dotFrames = (peak: number, end: number): Keyframe[] => [
  { ...IDLE_DOT, offset: 0, easing: "ease-out" },
  { ...LIT_DOT, offset: peak, easing: "ease-out" },
  { ...IDLE_DOT, offset: end },
  { ...IDLE_DOT, offset: 1 },
];

// Runs every [data-pulse] element's animation from the timeline while the chain is on screen.
// startTime = 0 pins them all to the page clock, so re-creating them (scrolling back into view, or a
// layout switch) never knocks them out of step. Changing restartKey re-creates them too, for a chain
// whose elements change without its timeline changing.
export const usePulse = (rootRef: RefObject<HTMLElement>, timeline: PulseTimeline, restartKey?: unknown) => {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { cardTime, cardStarts, links, linkStarts, cycle } = timeline;
    const frac = (s: number) => s / cycle;
    let animations: Animation[] = [];

    const stop = () => {
      animations.forEach((a) => a.cancel());
      animations = [];
    };
    const start = () => {
      stop();
      animations = Array.from(root.querySelectorAll<HTMLElement | SVGElement>("[data-pulse]")).map((el) => {
        const { pulse, seg, at, dash, axis } = el.dataset;
        const i = Number(el.dataset.i);
        const begin = seg === "card" ? cardStarts[i] : linkStarts[i];
        const length = seg === "card" ? cardTime : links[i];

        let frames: Keyframe[];
        let delay = begin;
        if (pulse === "trace") frames = traceFrames(frac(length), Number(dash));
        else if (pulse === "run") frames = runFrames(frac(length), frac(RUN_FADE), axis === "y" ? "Y" : "X");
        else {
          frames = dotFrames(frac(DOT_PEAK), frac(DOT_END));
          delay = (at === "end" ? begin + length : begin) - DOT_PEAK;
        }

        const animation = el.animate(frames, { duration: cycle * 1000, delay: delay * 1000, iterations: Infinity });
        animation.id = `pulse-${pulse}`;
        animation.startTime = 0;
        return animation;
      });
    };

    // Nothing needs animating while the chain is scrolled out of sight
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    observer.observe(root);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [rootRef, timeline, restartKey]);
};
