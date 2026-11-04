import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import lancewoodImg from "@/assets/project-lancewood.jpg";
import nikwafloraImg from "@/assets/project-nikwaflora.jpg";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LINE_GREY, chainTimeline, usePulse } from "@/lib/pulse";
import { cn } from "@/lib/utils";
import { Dot, PulseLayers } from "./PulseParts";

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
// pulse running along it (lib/pulse.ts). The chain runs across the card where both projects' figures fit
// on one line (1280px wide and up), and down it on narrower screens. Timing in seconds; quicker than the
// stats strip's, to suit the smaller pills.
const ACROSS_QUERY = "(min-width: 1280px)";
const PILL_TIME = 0.6; // round one pill
const WIRE_TIME = 0.25; // along one wire
const PAUSE = 0.5; // after a project's last pill, before the next project's first (or the first one's again)
const PILL_DASH = 0.25; // streak length, as a fraction of half a pill's border
// One pulse runs through the projects in turn: round the first project's pills, a short pause, then on
// through the next project's, and another pause before it starts over. So the pills are numbered on
// through all the chains, each project's from FIRST_PILL; the link from one chain's last pill to the next
// chain's first has no wire drawn, so it's only the pause.
const FIRST_PILL = projects.map((_, p) => projects.slice(0, p).reduce((n, q) => n + q.specs.length, 0));
const TIMELINE = chainTimeline(
  PILL_TIME,
  projects.flatMap((p, i) => [...Array(p.specs.length - 1).fill(WIRE_TIME), ...(i < projects.length - 1 ? [PAUSE] : [])]),
  { rest: PAUSE },
);

// Two half-borders round the pill, from where the pulse comes in to where it leaves, so it splits round
// the pill and rejoins where the next wire starts: left middle to right middle when the chain runs
// across, top middle to bottom middle when it runs down
const pillHalves = (w: number, h: number, across: boolean) => {
  if (!w || !h) return ["", ""];
  const x0 = 0.5, y0 = 0.5, x1 = w - 0.5, y1 = h - 0.5;
  const r = (y1 - y0) / 2; // fully rounded ends
  const cx = w / 2, cy = h / 2;
  return across
    ? [
        `M ${x0} ${cy} A ${r} ${r} 0 0 1 ${x0 + r} ${y0} L ${x1 - r} ${y0} A ${r} ${r} 0 0 1 ${x1} ${cy}`,
        `M ${x0} ${cy} A ${r} ${r} 0 0 0 ${x0 + r} ${y1} L ${x1 - r} ${y1} A ${r} ${r} 0 0 0 ${x1} ${cy}`,
      ]
    : [
        `M ${cx} ${y0} L ${x1 - r} ${y0} A ${r} ${r} 0 0 1 ${x1 - r} ${y1} L ${cx} ${y1}`,
        `M ${cx} ${y0} L ${x0 + r} ${y0} A ${r} ${r} 0 0 0 ${x0 + r} ${y1} L ${cx} ${y1}`,
      ];
};

const SpecPill = ({ index, across, children }: { index: number; across: boolean; children: ReactNode }) => {
  const ref = useRef<HTMLLIElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <li
      ref={ref}
      className="relative whitespace-nowrap rounded-full border bg-[#1b2b40] dark:bg-brand-navy-deep px-3 py-1.5 text-center text-[11px] font-semibold leading-4 text-white/90 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.6)]"
      style={{ borderColor: LINE_GREY }}
    >
      <svg
        aria-hidden="true"
        width={size.w}
        height={size.h}
        className="pulse-shine pointer-events-none absolute -left-px -top-px overflow-visible"
      >
        {pillHalves(size.w, size.h, across).map((d, half) => (
          <PulseLayers key={half} d={d} seg="card" index={index} dash={PILL_DASH} />
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

export const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const across = useMediaQuery(ACROSS_QUERY);
  // Turning the chains swaps the wires' streaks between sideways and downwards, so restart the pulse
  usePulse(sectionRef, TIMELINE, across);

  return (
    <section ref={sectionRef} id="projects" className="py-24 lg:py-32 bg-background">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong mb-3">
            Our work
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-foreground text-balance">
            Solar that keeps <span className="text-accent">farms running</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Two of our agricultural solar installations, built to keep working farms going through
            load-shedding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((p, i) => (
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
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {p.setting}
                </div>
                <h3 className="mt-2 font-display text-3xl font-bold uppercase text-foreground">{p.name}</h3>
                {/* Across, each pill is its own width. Down, they share the widest one's width, so the
                    wires run straight down their middles */}
                <ul className={cn("mt-6 flex", across ? "items-center" : "w-fit flex-col")}>
                  {p.specs.map((s, si) => (
                    <Fragment key={s}>
                      {si > 0 && <Wire index={FIRST_PILL[i] + si - 1} across={across} />}
                      <SpecPill index={FIRST_PILL[i] + si} across={across}>
                        {s}
                      </SpecPill>
                    </Fragment>
                  ))}
                </ul>
                <p className="mt-6 text-muted-foreground leading-relaxed">{p.summary}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
