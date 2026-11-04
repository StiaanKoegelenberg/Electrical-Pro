import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import lancewoodImg from "@/assets/project-lancewood.jpg";
import nikwafloraImg from "@/assets/project-nikwaflora.jpg";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LINE_GREY, streakPassed, usePulse, type PulseTimeline } from "@/lib/pulse";
import { cn } from "@/lib/utils";
import { Dot, PulseLayers } from "./PulseParts";
import { TitleSpace } from "./TitleSpace";

// Finished jobs, taken from the case studies on the old website. Only add figures the client has confirmed.
const projects = [
  {
    name: "Lancewood Dairy",
    setting: "Dairy farm",
    image: lancewoodImg,
    alt: "Rows of ground-mounted solar panels at Lancewood Dairy",
    specs: ["200 kWp solar", "200 kWh battery", "2 × 100 kW inverters"],
    summary:
      "The dairy used to fall back on a generator through load-shedding. Its milking machines, cooling and other equipment now run on a 200 kWp solar plant, with a Freedom Won battery storing the surplus and two Atess HPS100 inverters supplying the farm. The existing generator stays on as back-up and runs far less, cutting fuel and maintenance costs.",
  },
  {
    name: "Nikwaflora",
    setting: "Terranikwa flower farm, Outeniqua mountains",
    image: nikwafloraImg,
    alt: "Aerial view of solar panels on a shed roof at Terranikwa flower farm",
    specs: ["90 kW Victron inverters", "Fronius solar controllers", "Freedom Won batteries"],
    summary:
      "Terranikwa grows flowers on the southern slopes of the Outeniqua mountains and was facing high electricity bills and load-shedding. Its solar system cuts the farm's reliance on the grid, and the batteries carry production through outages and the night.",
  },
];

// Each project's figures are a chain of pills joined by short wires, with the stats strip's electrical
// pulse running along it (lib/pulse.ts). The chain runs across the card on wide screens (1280px and up)
// and on phones, and down it on tablets. Across, the first row takes the first two pills, or just the
// first where two don't fit; the rest hang below it, one per row and set in from the left, fed by a line
// that drops from under the middle of the first pill and turns into each of them.
const WIDE_QUERY = "(min-width: 1280px)";
const PHONE_QUERY = "(max-width: 767px)";

// Across: the most pills on the first row, and the space a wire leaves between neighbouring pills (see
// Wire). Pills hanging below the first row: the space between rows, how far right of the line dropping
// to them they start, and how round the line's corners are. The line drops from the middle of the first
// pill, or LONE_DROP in from its left end (just past its round end) where it has the row to itself.
// Where more than one pill hangs, each starts STAGGER further right than the one below it, as far as
// they fit. PILL_H is a pill's height (leading-4, py-1.5 and the border).
const FIRST_ROW_MAX = 2;
const GAP = 21;
const ROW_GAP = 24;
const RUN = 28;
const BEND = 10;
const PILL_H = 30;
const LONE_DROP = PILL_H;
const STAGGER = RUN;

// Timing in seconds; quicker than the stats strip's, to suit the smaller pills
const PILL_TIME = 0.6; // round one pill
const WIRE_TIME = 0.25; // along one wire
const HANDOVER = 0.44; // after one project's last pill, before the next project's first
const PAUSE = 0.5; // after the last project's last pill, before the first project's starts again
const PILL_DASH = 0.25; // streak length, as a fraction of half a pill's border
// On the line to the hanging pills, the streak's length and speed in px, the same on every branch, so
// where branches share the line down, their streaks run down it together as one
const BRANCH_STREAK = 16;
const BRANCH_SPEED = 260; // px a second

// The line from under the first pill to a pill hanging `depth` rows below the first row: down to the
// pill's middle, round the corner (a quadratic curve, about 1.15 times its radius) and in to the pill,
// `stagger` px further for a pill set further right
const branchLength = (depth: number, stagger: number) =>
  depth * (PILL_H + ROW_GAP) - PILL_H / 2 - BEND + 1.15 * BEND + (RUN - BEND) + stagger;
// The streak sets off just before the line's start and leaves just past its end (traceFrames in lib/pulse.ts)
const branchTime = (depth: number, stagger: number) =>
  (BRANCH_STREAK + 1.04 * branchLength(depth, stagger)) / BRANCH_SPEED;

// Across, how many of each project's pills go on the first row (up to FIRST_ROW_MAX, as many as fit),
// where the line to the rest drops from under the first pill (its middle, or nearer its left end where the
// hanging pills wouldn't otherwise fit), and how far apart the hanging pills are staggered (see STAGGER)
type ChainLayout = { firstRow: number; trunk: number; stagger: number };
const ALL_ON_ONE_ROW: ChainLayout[] = projects.map((p) => ({ firstRow: p.specs.length, trunk: 0, stagger: 0 }));
// How much further right than the last one the pill hanging `depth` rows down starts, of `count` hanging
const staggerAt = ({ stagger }: ChainLayout, count: number, depth: number) => (count - depth) * stagger;

// One pulse runs through the projects in turn: round the first project's pills, a short handover, then on
// through the next project's, and a pause before it starts over. So the pills are numbered on
// through all the chains, each project's from FIRST_PILL, and so are the links into them (pill n's is
// link n - 1); the link from one chain's last pill to the next chain's first has no wire drawn, so it's
// only the handover. A pill on the first row is fed by the pill before it, once the pulse has been round
// that one. Where pills hang below the first row, the pulse starts at the top of the first pill instead
// and splits both ways round it to the bottom (see SpecPill): halfway round, it passes through the dot
// on the pill's right and the wire there sets off, and once both halves meet at the bottom, so does the
// line down to the hanging pills. The further down a pill hangs, the later the pulse reaches it.
const FIRST_PILL = projects.map((_, p) => projects.slice(0, p).reduce((n, q) => n + q.specs.length, 0));
const PASSES_RIGHT = streakPassed(0.5, PILL_DASH); // how far through its trace round the first pill
const timelineFor = (chains: ChainLayout[]): PulseTimeline => {
  const cardStarts: number[] = [];
  const linkStarts: number[] = [];
  const links: number[] = [];
  let start = 0;
  projects.forEach((p, i) => {
    const first = FIRST_PILL[i];
    const hanging = p.specs.length - chains[i].firstRow;
    let end = 0;
    p.specs.forEach((_, si) => {
      const pill = first + si;
      if (si === 0) cardStarts[pill] = start;
      else {
        const depth = si - chains[i].firstRow + 1; // rows below the first row, for a hanging pill
        linkStarts[pill - 1] =
          hanging > 0 && si === 1 && depth <= 0
            ? cardStarts[first] + PILL_TIME * PASSES_RIGHT
            : cardStarts[depth > 0 ? first : pill - 1] + PILL_TIME;
        links[pill - 1] =
          depth > 0 ? branchTime(depth, staggerAt(chains[i], hanging, depth)) : WIRE_TIME;
        cardStarts[pill] = linkStarts[pill - 1] + links[pill - 1];
      }
      end = Math.max(end, cardStarts[pill] + PILL_TIME);
    });
    const last = i === projects.length - 1;
    if (!last) {
      linkStarts[first + p.specs.length - 1] = end;
      links[first + p.specs.length - 1] = HANDOVER;
    }
    start = end + (last ? PAUSE : HANDOVER);
  });
  return { cardTime: PILL_TIME, cardStarts, links, linkStarts, cycle: start };
};

// The layout of each project's chain across (see ChainLayout), measured from the pills and cards and kept
// up to date as they change (say when the font loads)
const useChainLayout = (lists: MutableRefObject<(HTMLUListElement | null)[]>, across: boolean) => {
  const [layout, setLayout] = useState(ALL_ON_ONE_ROW);

  useLayoutEffect(() => {
    if (!across) {
      setLayout(ALL_ON_ONE_ROW);
      return;
    }
    const measure = () => {
      const next = lists.current.map((list, i) => {
        if (!list) return ALL_ON_ONE_ROW[i];
        // A pixel to spare, so rounding never leaves the browser to wrap a pill itself
        const room = list.clientWidth - 1;
        const widths = [...list.querySelectorAll<HTMLElement>("[data-pill]")].map(
          (pill) => pill.getBoundingClientRect().width,
        );
        let firstRow = 1;
        let rowEnd = widths[0];
        const most = Math.min(widths.length, FIRST_ROW_MAX);
        while (firstRow < most && rowEnd + GAP + widths[firstRow] <= room) rowEnd += GAP + widths[firstRow++];
        const widest = Math.max(0, ...widths.slice(firstRow));
        const drop = firstRow === 1 ? LONE_DROP : widths[0] / 2;
        const trunk = Math.round(Math.max(PILL_H / 2, Math.min(drop, room - RUN - widest)));
        // Each hanging pill but the last steps right of the one below it, by as much of STAGGER as fits
        const hanging = widths.slice(firstRow);
        const roomToStep = hanging
          .slice(0, -1)
          .map((width, k) => (room - trunk - RUN - width) / (hanging.length - 1 - k));
        const stagger = hanging.length > 1 ? Math.max(0, Math.floor(Math.min(STAGGER, ...roomToStep))) : 0;
        return { firstRow, trunk, stagger };
      });
      setLayout((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const list of lists.current) {
      if (!list) continue;
      observer.observe(list);
      list.querySelectorAll("[data-pill]").forEach((pill) => observer.observe(pill));
    }
    return () => observer.disconnect();
  }, [lists, across]);

  return layout;
};

// Two half-borders round the pill, from where the pulse comes in to where it leaves, so it splits round
// the pill and rejoins where the next wire starts: left middle to right middle when the chain runs
// across, and from the top middle to the bottom when it runs down, meeting `meet` px in from the pill's
// left edge (its middle unless said). With each half's length in px.
const pillHalves = (w: number, h: number, across: boolean, meet?: number) => {
  if (!w || !h) return [{ d: "", length: 1 }, { d: "", length: 1 }];
  const x0 = 0.5, y0 = 0.5, x1 = w - 0.5, y1 = h - 0.5;
  const r = (y1 - y0) / 2; // fully rounded ends
  const cx = w / 2, cy = h / 2;
  const round = Math.PI * r;
  if (across) {
    const length = round + (x1 - x0 - 2 * r);
    return [
      { d: `M ${x0} ${cy} A ${r} ${r} 0 0 1 ${x0 + r} ${y0} L ${x1 - r} ${y0} A ${r} ${r} 0 0 1 ${x1} ${cy}`, length },
      { d: `M ${x0} ${cy} A ${r} ${r} 0 0 0 ${x0 + r} ${y1} L ${x1 - r} ${y1} A ${r} ${r} 0 0 0 ${x1} ${cy}`, length },
    ];
  }
  const mx = Math.min(x1 - r, Math.max(x0 + r, meet ?? cx));
  return [
    {
      d: `M ${cx} ${y0} L ${x1 - r} ${y0} A ${r} ${r} 0 0 1 ${x1 - r} ${y1} L ${mx} ${y1}`,
      length: x1 - r - cx + round + (x1 - r - mx),
    },
    {
      d: `M ${cx} ${y0} L ${x0 + r} ${y0} A ${r} ${r} 0 0 0 ${x0 + r} ${y1} L ${mx} ${y1}`,
      length: cx - x0 - r + round + (mx - x0 - r),
    },
  ];
};

// dropAt: where the line down to the hanging pills leaves the first pill's bottom, px in from its left
// edge. The pulse then goes round that pill from the top to there, as it does down the card, even though
// the chain runs across. indent: how far in from the left a pill hanging below the first row starts.
const SpecPill = ({
  index,
  across,
  dropAt,
  indent,
  children,
}: {
  index: number;
  across: boolean;
  dropAt?: number;
  indent?: number;
  children: ReactNode;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const halves = pillHalves(size.w, size.h, across && dropAt === undefined, dropAt);
  // Both halves take the same time, so they meet together even where one has further to go; their
  // streaks are kept the same length in px
  const mean = (halves[0].length + halves[1].length) / 2;

  return (
    <li
      ref={ref}
      data-pill
      className="relative whitespace-nowrap rounded-full border bg-[#1b2b40] dark:bg-brand-navy-deep px-3 py-1.5 text-center text-[11px] font-semibold leading-4 text-white/90 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.6)]"
      style={{ borderColor: LINE_GREY, marginLeft: indent }}
    >
      <svg
        aria-hidden="true"
        width={size.w}
        height={size.h}
        className="pulse-shine pointer-events-none absolute -left-px -top-px overflow-visible"
      >
        {halves.map(({ d, length }, half) => (
          <PulseLayers key={half} d={d} seg="card" index={index} dash={(PILL_DASH * mean) / length} />
        ))}
      </svg>
      {children}
    </li>
  );
};

// Short grey wire between neighbouring pills; the pulse runs along it and lights the dot at each end.
// Its end dots overlap the pills' edges by 5.5px, leaving gaps of 21px across and 13px down.
const Wire = ({ index, across }: { index: number; across: boolean }) => (
  <li
    aria-hidden="true"
    className={cn(
      "relative z-10 flex items-center self-center",
      across ? "-mx-[5.5px] w-8" : "-my-[5.5px] h-6 w-7 flex-col",
    )}
  >
    <Dot index={index} at="start" />
    {/* Track is bigger than the line so the glow isn't clipped by overflow-hidden */}
    <span className={cn("relative flex-1 overflow-hidden", across ? "h-7" : "w-full")}>
      <span
        className={cn("absolute", across ? "inset-x-0 top-[13px] h-px" : "inset-y-0 left-[13px] w-px")}
        style={{ backgroundColor: LINE_GREY }}
      />
      <span
        data-pulse="run"
        data-seg="link"
        data-i={index}
        data-axis={across ? "x" : "y"}
        className={cn(
          "pulse-shine absolute opacity-0",
          across
            ? "inset-x-0 top-1/2 -mt-px h-0.5 bg-[linear-gradient(90deg,transparent_5%,hsl(var(--accent-glow))_50%,hsl(200_100%_92%)_82%,transparent_100%)]"
            : "inset-y-0 left-1/2 -ml-px w-0.5 bg-[linear-gradient(180deg,transparent_5%,hsl(var(--accent-glow))_50%,hsl(200_100%_92%)_82%,transparent_100%)]",
        )}
      />
    </span>
    <Dot index={index} at="end" />
  </li>
);

// The line to the pills hanging below the first row (the last `count` pills): down from under the first
// pill, then round a corner into each one's left end, branching off where there's more than one. Drawn
// over the list from the pills' measured positions; branch k carries link firstLink + k. trunk and stagger
// are the chain's layout (see ChainLayout), so it's redrawn when they move the pills.
const Branches = ({
  firstLink,
  count,
  trunk,
  stagger,
}: {
  firstLink: number;
  count: number;
  trunk: number;
  stagger: number;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  const [geo, setGeo] = useState<{ start: [number, number]; ends: [number, number][]; paths: string[] } | null>(null);

  useLayoutEffect(() => {
    const list = ref.current?.parentElement;
    if (!list) return;
    const measure = () => {
      const pills = [...list.querySelectorAll<HTMLElement>("[data-pill]")];
      const first = pills[0];
      // Snap to pixel centres so the 1px line renders as one crisp line, not two faint ones
      const px = (v: number) => Math.round(v - 0.5) + 0.5;
      const x = px(first.offsetLeft + trunk);
      const top = first.offsetTop + first.offsetHeight;
      const ends = pills
        .slice(-count)
        .map((pill): [number, number] => [pill.offsetLeft, px(pill.offsetTop + pill.offsetHeight / 2)]);
      const paths = ends.map(([ex, ey]) => `M ${x} ${top} V ${ey - BEND} Q ${x} ${ey} ${x + BEND} ${ey} H ${ex}`);
      setGeo({ start: [x, top], ends, paths });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    list.querySelectorAll("[data-pill]").forEach((pill) => observer.observe(pill));
    return () => observer.disconnect();
  }, [count, trunk, stagger]);

  // Centred on the pills' borders, like the wires' dots
  const dotAt = (x: number, y: number) => ({ position: "absolute" as const, left: x - 4, top: y - 4 });
  const hidden = { display: "none" };

  return (
    <li ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        {geo?.paths.map((d, k) => <path key={k} d={d} fill="none" stroke={LINE_GREY} strokeWidth={1} />)}
      </svg>
      {/* Separate svg: CSS drop-shadow only applies to the outer svg element, and the grey line shouldn't glow */}
      <svg className="pulse-shine absolute inset-0 h-full w-full overflow-visible">
        {Array.from({ length: count }, (_, k) => (
          <PulseLayers
            key={k}
            d={geo?.paths[k] ?? ""}
            seg="link"
            index={firstLink + k}
            dash={BRANCH_STREAK / branchLength(k + 1, (count - k - 1) * stagger)}
          />
        ))}
      </svg>
      {/* Every branch sets off at once, so one dot under the first pill serves them all */}
      <Dot index={firstLink} at="start" style={geo ? dotAt(geo.start[0], geo.start[1] - 1.5) : hidden} />
      {Array.from({ length: count }, (_, k) => (
        <Dot
          key={k}
          index={firstLink + k}
          at="end"
          style={geo?.ends[k] ? dotAt(geo.ends[k][0] + 1.5, geo.ends[k][1]) : hidden}
        />
      ))}
    </li>
  );
};

// On phones each write-up starts folded down to three quarters of the height its first sentence and a
// half take up, fading out towards a Read more button (styled like the services' Learn more), so there's a
// taste of it without the whole paragraph in the way. The lines depend on the screen's width, so they're
// measured.
const Summary = ({ id, text, foldable }: { id: string; text: string; foldable: boolean }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  // In px: the folded height, the whole paragraph's and a line's; null when it isn't folding
  const [heights, setHeights] = useState<{ fold: number; full: number; line: number } | null>(null);

  useLayoutEffect(() => {
    const p = ref.current;
    const words = p?.firstChild;
    if (!foldable || !p || !words) {
      setHeights(null);
      return;
    }
    const measure = () => {
      // The lines down to halfway through the second sentence (a sentence and a half), less a quarter of
      // their height. That can cut a line partway, but down there the fade has all but hidden it.
      const firstEnd = text.indexOf(". ") + 1;
      const nextStop = text.indexOf(". ", firstEnd);
      const half = Math.round((firstEnd + (nextStop === -1 ? text.length : nextStop + 1)) / 2);
      const range = document.createRange();
      range.setStart(words, half);
      range.setEnd(words, half + 1);
      const line = parseFloat(getComputedStyle(p).lineHeight);
      const lines = Math.floor((range.getBoundingClientRect().top - p.getBoundingClientRect().top) / line) + 1;
      const fold = Math.max(1, lines * 0.75) * line;
      const full = p.scrollHeight;
      // Not worth folding away less than a line
      setHeights(full - fold >= line ? { fold, full, line } : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(p);
    return () => observer.disconnect();
  }, [foldable, text]);

  return (
    <div className="mt-6">
      <div
        className="relative overflow-hidden transition-[height] duration-500 ease-out motion-reduce:transition-none"
        style={heights ? { height: open ? heights.full : heights.fold } : undefined}
      >
        <p ref={ref} id={id} className="text-muted-foreground leading-relaxed">
          {text}
        </p>
        {heights && (
          // Fades the last lines out into the card, and itself away as the rest opens
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-card transition-opacity duration-500 motion-reduce:transition-none",
              open && "opacity-0",
            )}
            style={{ height: heights.line * 1.75 }}
          />
        )}
      </div>
      {heights && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="mt-3 inline-flex items-center gap-2 rounded-sm text-sm font-semibold uppercase tracking-wider text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {open ? "Read less" : "Read more"}
          <ArrowDown
            className={cn("h-4 w-4 transition-transform duration-300 motion-reduce:transition-none", open && "rotate-180")}
          />
        </button>
      )}
    </div>
  );
};

export const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const lists = useRef<(HTMLUListElement | null)[]>([]);
  const wide = useMediaQuery(WIDE_QUERY);
  const phone = useMediaQuery(PHONE_QUERY);
  const across = wide || phone;
  const layout = useChainLayout(lists, across);
  const timeline = useMemo(() => timelineFor(layout), [layout]);
  // Turning the chains swaps the wires' streaks between sideways and downwards, so restart the pulse
  usePulse(sectionRef, timeline, across);

  return (
    <section ref={sectionRef} id="projects" className="py-24 lg:py-32 bg-background">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <TitleSpace />
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-foreground text-balance">
            Solar <span className="text-accent">projects</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Two of our agricultural solar installations, built to keep working farms going through
            load-shedding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((p, i) => {
            const { firstRow, trunk, stagger } = layout[i];
            const hanging = p.specs.length - firstRow;
            return (
              <motion.article
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
              >
                <img
                  src={p.image}
                  alt={p.alt}
                  loading="lazy"
                  width={1200}
                  height={675}
                  className="aspect-video w-full object-cover"
                />
                <div className="p-6 lg:p-8">
                  <h3 className="font-display text-3xl font-bold uppercase text-foreground">{p.name}</h3>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {p.setting}
                  </div>
                  {/* Across, each pill is its own width. Down, they share the widest one's width, so the
                      wires run straight down their middles */}
                  <ul
                    ref={(el) => {
                      lists.current[i] = el;
                    }}
                    className={cn("relative mt-6 flex", across ? "flex-wrap items-center" : "w-fit flex-col")}
                  >
                    {p.specs.map((s, si) => {
                      const pill = FIRST_PILL[i] + si;
                      const hangs = si >= firstRow;
                      return (
                        <Fragment key={s}>
                          {si > 0 &&
                            (hangs ? (
                              // Starts a new row, ROW_GAP below the one above
                              <li aria-hidden="true" className="basis-full" style={{ height: ROW_GAP }} />
                            ) : (
                              <Wire index={pill - 1} across={across} />
                            ))}
                          <SpecPill
                            index={pill}
                            across={across}
                            // Where the line down leaves (see Branches, which snaps it to the pixel's centre)
                            dropAt={si === 0 && firstRow < p.specs.length ? trunk + 0.5 : undefined}
                            indent={
                              hangs ? trunk + RUN + staggerAt(layout[i], hanging, si - firstRow + 1) : undefined
                            }
                          >
                            {s}
                          </SpecPill>
                        </Fragment>
                      );
                    })}
                    {hanging > 0 && (
                      <Branches
                        firstLink={FIRST_PILL[i] + firstRow - 1}
                        count={hanging}
                        trunk={trunk}
                        stagger={stagger}
                      />
                    )}
                  </ul>
                  <Summary id={`project-${i}-summary`} text={p.summary} foldable={phone} />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
