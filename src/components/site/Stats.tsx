import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const stats = [
  { value: "30+", label: "Years of Experience" },
  { value: "10 000+", label: "Projects Completed" },
  { value: "4", label: "Specialist Sectors" },
  { value: "100%", label: "Garden Route Local" },
];

// Pulse timing in seconds
const CARD_TIME = 0.8; // around one card
const LINK_TIME = 0.4; // along a short connector
const SNAKE_TIME = 1.0; // along the long mobile wire from card 2 down to card 3
const DOT_PEAK = 0.1; // a connector dot is brightest this long after its animation starts
const DOT_END = 0.4; // ...and back to grey by here
const RUN_FADE = 0.05; // connector pulse fades in/out over this at each end

// Solid (not translucent) greys, so lines meeting under a dot don't show through or double up
const LINE_GREY = "hsl(214 14% 25%)";
const DOT_GREY = "hsl(214 9% 38%)";

// Streak length as a fraction of the path it travels: half a card border, or the whole long wire
const CARD_DASH = 0.22;
const SNAKE_DASH = 0.1;

// When each piece fires. A new pulse starts when the previous one is halfway round the third card,
// so the cycle is card 3's start plus half a card; the tail of each pulse overlaps the next one's start.
const buildTimeline = (mobile: boolean) => {
  const links = [LINK_TIME, mobile ? SNAKE_TIME : LINK_TIME, LINK_TIME];
  const cardStarts = [0];
  const linkStarts: number[] = [];
  for (let i = 0; i < links.length; i++) {
    linkStarts.push(cardStarts[i] + CARD_TIME);
    cardStarts.push(linkStarts[i] + links[i]);
  }
  return { cardStarts, linkStarts, links, cycle: cardStarts[2] + CARD_TIME / 2 };
};

const traceFrames = (win: number, dash: number): Keyframe[] => [
  { strokeDashoffset: `${dash + 0.02}`, offset: 0 },
  { strokeDashoffset: "-1.02", offset: win },
  { strokeDashoffset: "-1.02", offset: 1 },
];

const runFrames = (win: number, fade: number): Keyframe[] => {
  const x = (o: number) => `translateX(${-100 + 200 * (o / win)}%)`;
  return [
    { transform: x(0), opacity: 0, offset: 0 },
    { transform: x(fade), opacity: 1, offset: fade },
    { transform: x(win - fade), opacity: 1, offset: win - fade },
    { transform: x(win), opacity: 0, offset: win },
    { transform: x(win), opacity: 0, offset: 1 },
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

// Starts every [data-pulse] element's animation from the shared timeline. startTime = 0 pins them
// all to the page clock, so re-creating them (e.g. on a layout switch) never knocks them out of step.
const usePulse = (rootRef: RefObject<HTMLElement>, mobile: boolean) => {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { cardStarts, linkStarts, links, cycle } = buildTimeline(mobile);
    const frac = (s: number) => s / cycle;

    const animations = Array.from(root.querySelectorAll<HTMLElement | SVGElement>("[data-pulse]")).map((el) => {
      const { pulse, seg, at, dash } = el.dataset;
      const i = Number(el.dataset.i);
      const start = seg === "card" ? cardStarts[i] : linkStarts[i];
      const length = seg === "card" ? CARD_TIME : links[i];

      let frames: Keyframe[];
      let delay = start;
      if (pulse === "trace") frames = traceFrames(frac(length), Number(dash));
      else if (pulse === "run") frames = runFrames(frac(length), frac(RUN_FADE));
      else {
        frames = dotFrames(frac(DOT_PEAK), frac(DOT_END));
        delay = (at === "end" ? start + length : start) - DOT_PEAK;
      }

      const animation = el.animate(frames, { duration: cycle * 1000, delay: delay * 1000, iterations: Infinity });
      animation.id = `pulse-${pulse}`;
      animation.startTime = 0;
      return animation;
    });
    return () => animations.forEach((a) => a.cancel());
  }, [rootRef, mobile]);
};

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

const PulseLayers = ({ d, seg, index, dash }: { d: string; seg: "card" | "link"; index: number; dash: number }) => (
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

// Two half-borders from the left-middle to the right-middle, so the pulse splits around the card
// and rejoins where the next connector starts.
const halfBorders = (w: number, h: number) => {
  if (!w || !h) return ["", ""];
  const x0 = 0.5, y0 = 0.5, x1 = w - 0.5, y1 = h - 0.5;
  const r = 15.5; // rounded-2xl minus half the border
  const cy = h / 2;
  return [
    `M ${x0} ${cy} L ${x0} ${y0 + r} A ${r} ${r} 0 0 1 ${x0 + r} ${y0} L ${x1 - r} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y0 + r} L ${x1} ${cy}`,
    `M ${x0} ${cy} L ${x0} ${y1 - r} A ${r} ${r} 0 0 0 ${x0 + r} ${y1} L ${x1 - r} ${y1} A ${r} ${r} 0 0 0 ${x1} ${y1 - r} L ${x1} ${cy}`,
  ];
};

const StatCard = ({ index, children }: { index: number; children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      data-stat-card
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative min-w-0 md:flex-1 rounded-2xl border bg-brand-navy-deep px-2 sm:px-4 py-5 lg:py-8 text-center shadow-[0_18px_40px_-12px_rgba(0,0,0,0.75)]"
      style={{ borderColor: LINE_GREY }}
    >
      <svg
        aria-hidden="true"
        width={size.w}
        height={size.h}
        className="pulse-shine pointer-events-none absolute -left-px -top-px overflow-visible"
      >
        {halfBorders(size.w, size.h).map((d, half) => (
          <PulseLayers key={half} d={d} seg="card" index={index} dash={CARD_DASH} />
        ))}
      </svg>
      {children}
    </motion.div>
  );
};

const Dot = ({ index, at, style }: { index: number; at: "start" | "end"; style?: CSSProperties }) => (
  <span
    data-pulse="dot"
    data-seg="link"
    data-i={index}
    data-at={at}
    className="h-2 w-2 shrink-0 rounded-full"
    style={{ backgroundColor: DOT_GREY, ...style }}
  />
);

// Short grey link between two cards in the same row; the pulse runs along it and lights each end dot
const Connector = ({ index, className = "flex" }: { index: number; className?: string }) => (
  <motion.div
    aria-hidden="true"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
    className={`${className} relative z-10 items-center self-center w-8 md:w-10 lg:w-14 -mx-1`}
  >
    <Dot index={index} at="start" />
    {/* Track is taller than the line so the glow isn't clipped by overflow-hidden */}
    <span className="relative flex-1 h-7 overflow-hidden">
      <span className="absolute inset-x-0 top-[13px] h-px" style={{ backgroundColor: LINE_GREY }} />
      <span
        data-pulse="run"
        data-seg="link"
        data-i={index}
        className="pulse-shine absolute inset-x-0 top-1/2 -mt-px h-0.5 opacity-0 bg-[linear-gradient(90deg,transparent_5%,hsl(var(--accent-glow))_50%,hsl(200_100%_92%)_82%,transparent_100%)]"
      />
    </span>
    <Dot index={index} at="end" />
  </motion.div>
);

// Mobile only: the wire from card 2's right edge, out past it, back under the top row and into
// card 3's left edge. Drawn over the grid from the cards' measured positions.
const SnakeWire = ({ gridRef }: { gridRef: RefObject<HTMLDivElement> }) => {
  const [geo, setGeo] = useState<{ d: string; a: [number, number]; b: [number, number] } | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => {
      const cards = grid.querySelectorAll<HTMLElement>("[data-stat-card]");
      const [from, to] = [cards[1], cards[2]];
      if (!from || !to || !from.offsetWidth) return setGeo(null);
      // Snap to pixel centres so the 1px wire renders as one crisp line, not two faint ones
      const px = (v: number) => Math.round(v - 0.5) + 0.5;
      const a: [number, number] = [from.offsetLeft + from.offsetWidth, px(from.offsetTop + from.offsetHeight / 2)];
      const b: [number, number] = [to.offsetLeft, px(to.offsetTop + to.offsetHeight / 2)];
      const ym = px((from.offsetTop + from.offsetHeight + to.offsetTop) / 2);
      const xR = px(a[0] + 12), xL = px(b[0] - 12), r = 10;
      const d =
        `M ${a[0]} ${a[1]} H ${xR - r} Q ${xR} ${a[1]} ${xR} ${a[1] + r} V ${ym - r} Q ${xR} ${ym} ${xR - r} ${ym} ` +
        `H ${xL + r} Q ${xL} ${ym} ${xL} ${ym + r} V ${b[1] - r} Q ${xL} ${b[1]} ${xL + r} ${b[1]} H ${b[0]}`;
      setGeo({ d, a, b });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [gridRef]);

  const dotAt = ([x, y]: [number, number]) => ({ position: "absolute" as const, left: x - 4, top: y - 4 });

  return (
    <div aria-hidden="true" className="md:hidden pointer-events-none absolute inset-0 z-10">
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        <path d={geo?.d ?? ""} fill="none" stroke={LINE_GREY} strokeWidth={1} />
      </svg>
      {/* Separate svg: CSS drop-shadow only applies to the outer svg element, and the grey wire shouldn't glow */}
      <svg className="pulse-shine absolute inset-0 h-full w-full overflow-visible">
        <PulseLayers d={geo?.d ?? ""} seg="link" index={1} dash={SNAKE_DASH} />
      </svg>
      <Dot index={1} at="start" style={geo ? dotAt(geo.a) : { display: "none" }} />
      <Dot index={1} at="end" style={geo ? dotAt(geo.b) : { display: "none" }} />
    </div>
  );
};

export const Stats = () => {
  const mobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  usePulse(sectionRef, mobile);

  const card = (i: number) => (
    <StatCard index={i}>
      <div className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-electric bg-clip-text text-transparent">
        {stats[i].value}
      </div>
      <div className="mt-2 text-[10px] lg:text-xs leading-snug uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/60">
        {stats[i].label}
      </div>
    </StatCard>
  );

  // Phones: 2×2 grid, cards 2→3 joined by the long wire. md and up: one row with three short links.
  return (
    <section ref={sectionRef} className="bg-brand-navy-deep border-y border-white/5">
      <div className="container py-12 lg:py-16">
        <div
          ref={gridRef}
          className="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-y-12 md:flex md:items-stretch"
        >
          {card(0)}
          <Connector index={0} />
          {card(1)}
          <Connector index={1} className="hidden md:flex" />
          {card(2)}
          <Connector index={2} />
          {card(3)}
          <SnakeWire gridRef={gridRef} />
        </div>
      </div>
    </section>
  );
};
