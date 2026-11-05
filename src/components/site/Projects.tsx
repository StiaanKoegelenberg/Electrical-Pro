import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import lancewoodImg from "@/assets/project-lancewood.jpg";
import nikwafloraImg from "@/assets/project-nikwaflora.jpg";
import { useMediaQuery } from "@/hooks/use-media-query";
import { FLOW_BOXES, FLOW_WIRES, flowPulse, useFlowGeometries, type FlowGeometry } from "@/lib/power-flow";
import { usePulse, type PulseParts, type PulseTimeline } from "@/lib/pulse";
import { cn } from "@/lib/utils";
import { PowerFlow } from "./PowerFlow";
import { TitleSpace } from "./TitleSpace";

// Finished jobs, taken from the case studies on the old website. Only add figures the client has confirmed.
// Each project's system is drawn as a power-flow diagram from its figures (system; see PowerFlow.tsx).
const projects = [
  {
    name: "Lancewood Dairy",
    setting: "Dairy farm",
    image: lancewoodImg,
    alt: "Rows of ground-mounted solar panels at Lancewood Dairy",
    system: { inverterName: "Hybrid inverter", inverter: "200 kW", solar: "200 kWp", battery: "400 kWh" },
    summary:
      "The dairy used to fall back on a generator through load-shedding. Its milking machines, cooling and other equipment now run on a 200 kWp solar plant, with a Freedom Won battery storing the surplus and two Atess HPS100 inverters supplying the farm. The existing generator stays on as back-up and runs far less, cutting fuel and maintenance costs.",
  },
  {
    name: "Nikwaflora",
    setting: "Terranikwa flower farm, Outeniqua mountains",
    image: nikwafloraImg,
    alt: "Aerial view of solar panels on a shed roof at Terranikwa flower farm",
    system: { inverterName: "Inverter", inverter: "90 kW", solar: "100 kWp", battery: "90 kWh" },
    summary:
      "Terranikwa grows flowers on the southern slopes of the Outeniqua mountains and was facing high electricity bills and load-shedding. Its solar system cuts the farm's reliance on the grid, and the batteries carry production through outages and the night.",
  },
];

// The write-ups fold on phones (see Summary)
const PHONE_QUERY = "(max-width: 767px)";

// The electrical pulse (lib/pulse.ts) runs through each project's diagram in turn: through the first
// project's, a short handover, then on through the next project's. Shortly after the last project's sets
// off (RESTART), the first project's sets off again, so the two overlap. The pieces it lights are numbered
// on through all the diagrams: each one's boxes from FLOW_BOXES * i and its wires from FLOW_WIRES * i.
const HANDOVER = 0.44; // in seconds, after one project's pulse finishes, before the next project's sets off
const RESTART = 0.5; // after the last project's pulse sets off, before the first project's sets off again

const timelineFor = (geometries: (FlowGeometry | null)[]): PulseTimeline => {
  const parts: PulseParts = { cardStarts: [], cardTimes: [], links: [], linkStarts: [] };
  let start = 0;
  let cycle = 0;
  projects.forEach((_, i) => {
    const end = flowPulse(geometries[i], FLOW_BOXES * i, FLOW_WIRES * i, start, parts);
    if (i < projects.length - 1) start = end + HANDOVER;
    else cycle = start + RESTART;
  });
  // Every box has its own time round it (cardTimes), so there's no common one
  return { cardTime: 0, ...parts, cycle };
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
  const figures = useRef<(HTMLElement | null)[]>([]);
  const phone = useMediaQuery(PHONE_QUERY);
  const geometries = useFlowGeometries(figures, projects.length);
  const timeline = useMemo(() => timelineFor(geometries), [geometries]);
  usePulse(sectionRef, timeline);

  return (
    <section ref={sectionRef} id="projects" className="py-24 lg:py-32 bg-background">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <TitleSpace />
          <h2 className="font-display text-heading sm:text-5xl lg:text-7xl font-bold uppercase text-foreground text-balance">
            Solar <span className="text-accent">projects</span>
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
                <h3 className="font-display text-3xl font-bold uppercase text-foreground">{p.name}</h3>
                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {p.setting}
                </div>
                <PowerFlow
                  system={p.system}
                  cards={FLOW_BOXES * i}
                  links={FLOW_WIRES * i}
                  geometry={geometries[i]}
                  figureRef={(el) => {
                    figures.current[i] = el;
                  }}
                />
                <Summary id={`project-${i}-summary`} text={p.summary} foldable={phone} />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
