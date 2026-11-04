import { useLayoutEffect, useState, type MutableRefObject } from "react";
import { streakPassed, streakReaches, type PulseParts } from "@/lib/pulse";

// A project's whole system drawn as a power-flow diagram, after the client's sketches: the grid, the
// inverter and the AC loads across the top, the solar panels, the battery and the essential loads across
// the bottom, joined by wires. The projects' electrical pulse (lib/pulse.ts) runs through it the way the
// power flows: from the solar panels into the battery, from the grid and the battery into the inverter,
// and from the inverter out to both sets of loads. It comes into each box on the left, splits round it and
// rejoins on the far side, and sets a wire off as it passes that wire's dot. This is the diagram's
// geometry and timing; it's drawn by components/site/PowerFlow.tsx.

// A system's figures, and what its inverter box is called
export type PowerSystem = { inverterName: string; inverter: string; solar: string; battery: string };

// The boxes, in the order they're laid out (three to a row), and the wires between them
const GRID = 0, INVERTER = 1, AC = 2, SOLAR = 3, BATTERY = 4, ESSENTIAL = 5;
export const FLOW_BOXES = 6;
const SOLAR_BATTERY = 0, BATTERY_INVERTER = 1, GRID_INVERTER = 2, INVERTER_AC = 3, INVERTER_ESSENTIAL = 4;
export const FLOW_WIRES = 5;

// In px: the boxes' corner radius; how far apart the inverter's two wires out leave it (the AC loads'
// above the middle of its right side, the essential loads' below; the grid's wire comes into the middle of
// its left side); how round the essential loads' wire's corners are; and how far inside a box's outer edge
// the middle of its 1px border is, where each wire's dot is centred and its wire ends
export const FLOW_RADIUS = 12;
const SPLIT = 14;
const BEND = 10;
const DOT_IN = 0.5;
// The streak's length in px, the same round the boxes as along the wires (on a short wire it's cut to
// fit), and its speed
const STREAK = 24;
const SPEED = 280; // px a second

// The streak sets off just before a path's start and leaves just past its end (traceFrames in lib/pulse.ts)
const travel = (length: number, streak: number) => (streak + 1.04 * length) / SPEED;

// Snapped to a pixel's centre, so a 1px line is drawn crisp rather than as two faint ones
const snap = (v: number) => Math.round(v - 0.5) + 0.5;

type Box = { l: number; t: number; r: number; b: number };
export type Point = [number, number];
type Trace = { d: string; dash: number };
export type FlowGeometry = {
  // Each box's outline, along the middle of its 1px border (draw it with a radius of FLOW_RADIUS - 0.5)
  frames: { x: number; y: number; width: number; height: number }[];
  // Each box's border in two halves, each way round from where the pulse comes in to where they meet,
  // and the pulse's time round it
  boxes: { halves: Trace[]; time: number }[];
  // Each wire, from the middle of its start dot to the middle of its end dot
  wires: (Trace & { time: number; start: Point; end: Point })[];
  // How far through its run round the inverter (0 to 1) the pulse is when it reaches the line up from the
  // battery, along the bottom, and when it has passed the wire to the AC loads, down the right side
  inverterIn: number;
  acOut: number;
};

// A box's sides, clockwise from the top, and a point on one of them: its x on the top or bottom, its y on
// the left or right
const TOP = 0, RIGHT = 1, BOTTOM = 2, LEFT = 3;
type Spot = { side: number; at: number };

// Part of a box's border (along the middle of its 1px line), from a point on one side round to a point on
// another side, clockwise or the other way, past the rounded corners between. With its length, and how
// far along it a point on any side it runs along is.
const borderPath = ({ l, t, r, b }: Box, from: Spot, to: Spot, clockwise: boolean) => {
  const rad = FLOW_RADIUS - 0.5;
  const x0 = l + 0.5, x1 = r - 0.5, y0 = t + 0.5, y1 = b - 0.5;
  // Where each side's straight part starts and ends, going clockwise
  const sides: [Point, Point][] = [
    [[x0 + rad, y0], [x1 - rad, y0]],
    [[x1, y0 + rad], [x1, y1 - rad]],
    [[x1 - rad, y1], [x0 + rad, y1]],
    [[x0, y1 - rad], [x0, y0 + rad]],
  ];
  const onSide = ({ side, at }: Spot): Point => (side % 2 ? [sides[side][0][0], at] : [at, sides[side][0][1]]);
  const apart = (p: Point, q: Point) => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]);
  const corner = (Math.PI * rad) / 2;
  let side = from.side;
  let here = onSide(from);
  let length = 0;
  let d = `M ${here[0]} ${here[1]}`;
  const entered: { side: number; at: Point; length: number }[] = [];
  // Along each side in turn and round the corner onto the next, until it reaches the side `to` is on
  for (;;) {
    entered.push({ side, at: here, length });
    const last = side === to.side;
    const stop = last ? onSide(to) : sides[side][clockwise ? 1 : 0];
    d += ` L ${stop[0]} ${stop[1]}`;
    length += apart(here, stop);
    if (last) break;
    side = (side + (clockwise ? 1 : 3)) % 4;
    here = sides[side][clockwise ? 0 : 1];
    d += ` A ${rad} ${rad} 0 0 ${clockwise ? 1 : 0} ${here[0]} ${here[1]}`;
    length += corner;
  }
  return {
    d,
    length,
    along: (spot: Spot) => {
      const passing = entered.find((e) => e.side === spot.side)!;
      return passing.length + apart(passing.at, onSide(spot));
    },
  };
};

// The wires and the pulse's paths from where the boxes are, in px from the diagram's top left
const layOut = (box: Box[]): FlowGeometry => {
  const inverter = box[INVERTER], battery = box[BATTERY], essential = box[ESSENTIAL];
  const middle = snap((inverter.t + inverter.b) / 2); // the grid's wire, centred on both boxes' sides
  const top = snap((inverter.t + inverter.b) / 2 - SPLIT / 2); // the AC loads' wire
  const toEssential = top + SPLIT;
  const bottom = snap((battery.t + battery.b) / 2); // the solar panels' wire, and into the essential loads
  const riser = snap((inverter.l + inverter.r) / 2); // up from the battery
  const drop = snap((inverter.r + box[AC].l) / 2); // down to the essential loads
  const bend = Math.max(0, Math.min(BEND, drop - inverter.r, essential.l - drop, (bottom - toEssential) / 2));

  const across = (from: Box, to: Box, y: number) => {
    const x0 = from.r - DOT_IN, x1 = to.l + DOT_IN;
    return { d: `M ${x0} ${y} H ${x1}`, length: x1 - x0, start: [x0, y] as Point, end: [x1, y] as Point };
  };
  const up = { from: battery.t + DOT_IN, to: inverter.b - DOT_IN };
  const turn = { from: inverter.r - DOT_IN, to: essential.l + DOT_IN };
  const wires = [
    across(box[SOLAR], battery, bottom),
    {
      d: `M ${riser} ${up.from} V ${up.to}`,
      length: up.from - up.to,
      start: [riser, up.from] as Point,
      end: [riser, up.to] as Point,
    },
    across(box[GRID], inverter, middle),
    across(inverter, box[AC], top),
    {
      d: `M ${turn.from} ${toEssential} H ${drop - bend} A ${bend} ${bend} 0 0 1 ${drop} ${toEssential + bend} V ${bottom - bend} A ${bend} ${bend} 0 0 0 ${drop + bend} ${bottom} H ${turn.to}`,
      length: turn.to - turn.from + bottom - toEssential - (4 - Math.PI) * bend,
      start: [turn.from, toEssential] as Point,
      end: [turn.to, bottom] as Point,
    },
  ].map(({ length, ...wire }) => {
    const streak = Math.min(STREAK, 0.7 * length);
    return { ...wire, dash: streak / length, time: travel(length, streak) };
  });

  // Where the pulse comes into each box, on its left, and where its two halves meet: on its right, or on
  // the battery, at the top, where the line up to the inverter leaves
  const ins = [middle, middle, top, bottom, bottom, bottom].map((at): Spot => ({ side: LEFT, at }));
  const outs: Spot[] = [
    { side: RIGHT, at: middle },
    { side: RIGHT, at: toEssential },
    { side: RIGHT, at: top },
    { side: RIGHT, at: bottom },
    { side: TOP, at: riser },
    { side: RIGHT, at: bottom },
  ];
  // Up from the left and over the top, and down and under the bottom
  const halves = box.map((b, k) => [true, false].map((clockwise) => borderPath(b, ins[k], outs[k], clockwise)));
  // Both halves take the same time, so they meet together; their streaks are the same length in px
  const boxes = halves.map((pair) => ({
    halves: pair.map(({ d, length }) => ({ d, dash: STREAK / length })),
    time: travel((pair[0].length + pair[1].length) / 2, STREAK),
  }));
  const [inverterOver, inverterUnder] = halves[INVERTER];
  const share = (half: typeof inverterOver, at: Spot) => half.along(at) / half.length;
  return {
    frames: box.map(({ l, t, r, b }) => ({ x: l + 0.5, y: t + 0.5, width: r - l - 1, height: b - t - 1 })),
    boxes,
    wires,
    inverterIn: streakReaches(share(inverterUnder, { side: BOTTOM, at: riser }), STREAK / inverterUnder.length),
    acOut: streakPassed(share(inverterOver, { side: RIGHT, at: top }), STREAK / inverterOver.length),
  };
};

// Until the boxes have been measured: a diagram about the width of a phone's
const NOMINAL = layOut(
  [0, 1].flatMap((row) => [0, 1, 2].map((col) => ({ l: col * 106, t: row * 96, r: col * 106 + 84, b: row * 96 + 66 }))),
);

// Writes when the pulse runs round each box and along each wire into the timeline's parts, the boxes
// numbered from `cards` and the wires from `links`, starting `start` seconds into the cycle, and returns
// when it's done. It sets off round the solar panels, along to the battery and round it to the top, where
// both halves meet and the line up to the inverter sets off. It sets off round the grid just in time for
// the grid's streak into the inverter to come round under the inverter's bottom as the battery's comes up
// into it. The inverter's top half passes the AC loads' wire on its way down to where the halves meet, at
// the essential loads' wire.
export const flowPulse = (
  geometry: FlowGeometry | null,
  cards: number,
  links: number,
  start: number,
  parts: PulseParts,
) => {
  const { boxes, wires, inverterIn, acOut } = geometry ?? NOMINAL;
  const box = boxes.map((b) => b.time);
  const wire = wires.map((w) => w.time);
  const at: number[] = []; // when the pulse sets off round each box
  const off: number[] = []; // ...and along each wire
  at[SOLAR] = 0;
  off[SOLAR_BATTERY] = at[SOLAR] + box[SOLAR];
  at[BATTERY] = off[SOLAR_BATTERY] + wire[SOLAR_BATTERY];
  off[BATTERY_INVERTER] = at[BATTERY] + box[BATTERY];
  const meet = off[BATTERY_INVERTER] + wire[BATTERY_INVERTER] * streakReaches(1, wires[BATTERY_INVERTER].dash);
  at[INVERTER] = meet - box[INVERTER] * inverterIn;
  off[GRID_INVERTER] = at[INVERTER] - wire[GRID_INVERTER];
  at[GRID] = off[GRID_INVERTER] - box[GRID];
  off[INVERTER_AC] = at[INVERTER] + box[INVERTER] * acOut;
  off[INVERTER_ESSENTIAL] = at[INVERTER] + box[INVERTER];
  at[AC] = off[INVERTER_AC] + wire[INVERTER_AC];
  at[ESSENTIAL] = off[INVERTER_ESSENTIAL] + wire[INVERTER_ESSENTIAL];

  const first = Math.min(...at, ...off);
  at.forEach((s, k) => {
    parts.cardStarts[cards + k] = start + s - first;
    parts.cardTimes[cards + k] = box[k];
  });
  off.forEach((s, k) => {
    parts.linkStarts[links + k] = start + s - first;
    parts.links[links + k] = wire[k];
  });
  return start + Math.max(...at.map((s, k) => s + box[k])) - first;
};

// Each of `count` diagrams' wires and pulse paths (null until it's measured), measured from where its
// boxes are and kept up to date as they move (say when the font loads)
export const useFlowGeometries = (figures: MutableRefObject<(HTMLElement | null)[]>, count: number) => {
  const [geometries, setGeometries] = useState<(FlowGeometry | null)[]>(() => Array(count).fill(null));

  useLayoutEffect(() => {
    const measureOne = (figure: HTMLElement | null) => {
      if (!figure) return null;
      const origin = figure.getBoundingClientRect();
      // Whole pixels, as the browser draws the boxes' borders
      const box = [...figure.querySelectorAll<HTMLElement>("[data-flow-box]")].map((el): Box => {
        const r = el.getBoundingClientRect();
        return {
          l: Math.round(r.left - origin.left),
          t: Math.round(r.top - origin.top),
          r: Math.round(r.right - origin.left),
          b: Math.round(r.bottom - origin.top),
        };
      });
      return box.length === FLOW_BOXES ? layOut(box) : null;
    };
    const measure = () => {
      const next = Array.from({ length: count }, (_, i) => measureOne(figures.current[i]));
      setGeometries((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const figure of figures.current) {
      if (!figure) continue;
      observer.observe(figure);
      figure.querySelectorAll("[data-flow-box]").forEach((el) => observer.observe(el));
    }
    return () => observer.disconnect();
  }, [figures, count]);

  return geometries;
};
