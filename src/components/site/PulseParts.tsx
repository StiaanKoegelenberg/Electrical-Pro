import type { CSSProperties } from "react";
import { DOT_GREY, DOT_LIT } from "@/lib/pulse";

// The elements the travelling pulse animates (see lib/pulse.ts). Their data-pulse attributes tell usePulse
// what each one is and where it sits in the chain.

// Soft halo, blue body, then a white-hot tip on the leading end of each streak
const TRACE_LAYERS = [
  { width: 6, color: "hsl(var(--accent-glow) / 0.3)", cap: "round", core: false },
  { width: 2.5, color: "hsl(var(--accent-glow))", cap: "round", core: false },
  { width: 1.25, color: "hsl(200 100% 92%)", cap: "butt", core: true },
] as const;

// Streak pattern for one layer; the core is the leading 36% of the same streak.
// Each pattern repeats every ~2 path-lengths, so only one streak is ever on the path.
const dashArray = (dash: number, core: boolean) =>
  core ? `0 ${dash * 0.64} ${dash * 0.36} ${2 - dash}` : `${dash} 2`;

// A streak of light along the path d: round an item's border (seg "card") or along a wire (seg "link")
export const PulseLayers = ({ d, seg, index, dash }: { d: string; seg: "card" | "link"; index: number; dash: number }) => (
  <>
    {TRACE_LAYERS.map((layer, li) => (
      <path
        key={li}
        d={d}
        pathLength={1}
        fill="none"
        strokeWidth={layer.width}
        strokeLinecap={layer.cap}
        data-pulse="trace"
        data-seg={seg}
        data-i={index}
        data-dash={dash}
        style={{ stroke: layer.color, strokeDasharray: dashArray(dash, layer.core), strokeDashoffset: `${dash + 0.02}` }}
      />
    ))}
  </>
);

// A dot at one end of a wire, which lights up as the pulse passes
export const Dot = ({ index, at, style }: { index: number; at: "start" | "end"; style?: CSSProperties }) => (
  <span
    data-pulse="dot"
    data-seg="link"
    data-i={index}
    data-at={at}
    className="h-2 w-2 shrink-0 rounded-full"
    style={{ backgroundColor: DOT_GREY, ...style }}
  />
);

// For a wire drawn in an svg, its dot is drawn there too, so it sits exactly on the wire: a plain grey
// circle, and over it this bright copy, which shows as the pulse passes. Its svg wants the pulse-shine glow.
export const DotFlash = ({
  index,
  at,
  cx,
  cy,
  r,
}: {
  index: number;
  at: "start" | "end";
  cx: number;
  cy: number;
  r: number;
}) => (
  <circle
    data-pulse="flash"
    data-seg="link"
    data-i={index}
    data-at={at}
    cx={cx}
    cy={cy}
    r={r}
    style={{ fill: DOT_LIT, opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}
  />
);
