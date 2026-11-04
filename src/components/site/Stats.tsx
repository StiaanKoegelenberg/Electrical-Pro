import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { LINE_GREY, chainTimeline, usePulse } from "@/lib/pulse";
import { Dot, PulseLayers } from "./PulseParts";

const stats = [
  { value: "30+", label: "Years of Experience" },
  { value: "10 000+", label: "Projects Completed" },
  { value: "4", label: "Specialist Sectors" },
  { value: "100%", label: "Garden Route Local" },
];

// Pulse timing in seconds; the pulse itself is in lib/pulse.ts
const CARD_TIME = 0.8; // around one card
const LINK_TIME = 0.4; // along a short connector
const SNAKE_TIME = 1.0; // along the long mobile wire from card 2 down to card 3

// Streak length as a fraction of the path it travels: half a card border, or the whole long wire
const CARD_DASH = 0.22;
const SNAKE_DASH = 0.1;

// A new pulse starts when the previous one is halfway round the third card
const buildTimeline = (mobile: boolean) =>
  chainTimeline(CARD_TIME, [LINK_TIME, mobile ? SNAKE_TIME : LINK_TIME, LINK_TIME], { restartAt: 2 });

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
  const timeline = useMemo(() => buildTimeline(mobile), [mobile]);
  usePulse(sectionRef, timeline);

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
