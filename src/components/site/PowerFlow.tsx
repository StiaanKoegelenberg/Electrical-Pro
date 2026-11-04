import type { ComponentType, CSSProperties, Ref, SVGProps } from "react";
import { FLOW_RADIUS, FLOW_WIRES, type FlowGeometry, type PowerSystem } from "@/lib/power-flow";
import { DOT_GREY, LINE_GREY } from "@/lib/pulse";
import { cn } from "@/lib/utils";
import { AcIcon, BatteryIcon, EssentialIcon, GridIcon, InverterIcon, SunIcon } from "./PowerIcons";
import { DotFlash, PulseLayers } from "./PulseParts";

// The power-flow diagram (see lib/power-flow.ts): six boxes, three to a row, joined by wires. The boxes'
// outlines, the wires, their dots and the pulse's paths are all drawn in svg, in the same coordinates,
// from where the boxes have been measured to be, so every dot sits centred on its box's edge with its wire
// running into its middle (lines drawn in html and svg can land a pixel apart). The boxes themselves
// only hold the words and symbols.

// Sized to the diagram's width (cqi), which doesn't simply grow with the screen's: the cards sit two
// across from tablets up. A box with a figure has its name small above it; one without, its name big.
// The smallest sizes are for the narrowest phones (320px), where the diagram is about 220px wide; the
// labels are 10px from 360px phones up.
const PAD_Y = "clamp(10px, 2.6cqi, 14px)";
const LABEL_SIZE = "clamp(9px, 2.5cqi + 3.45px, 12px)";
const FIGURE_SIZE = "clamp(14px, 6.4cqi, 26px)";
// Each box's symbol sits beside its name on desktop (xl), and above it, in the box's top corner, on
// phones and tablets, where the boxes are too narrow for both side by side: on the left, but on the
// right for the loads. 20px on desktop, the size the symbols are drawn for (PowerIcons.tsx).
const SYMBOL_SIZE = "clamp(16px, 4.2cqi, 20px)";
const GRID_GAPS: CSSProperties = { columnGap: "clamp(16px, 7.5cqi, 40px)", rowGap: "clamp(28px, 8cqi, 40px)" };
const BOX_PADDING: CSSProperties = { paddingInline: "clamp(6px, 3cqi, 16px)", paddingBlock: PAD_Y };
const NAME: CSSProperties = { fontSize: "clamp(13px, 5.2cqi, 20px)" };
const LABEL: CSSProperties = { fontSize: LABEL_SIZE };
const FIGURE: CSSProperties = { fontSize: FIGURE_SIZE };
const SYMBOL: CSSProperties = { width: SYMBOL_SIZE, height: SYMBOL_SIZE };
// Every box is at least as tall as one whose small name takes two lines over its figure, the most any
// takes, so the diagrams all come out the same size whatever their names and figures: the padding and
// 1px borders, the symbol and the gap under it (gap-1.5) on phones and tablets or beside the name on
// desktop, two lines of name (leading-tight), the gap over the figure (mt-1) and the figure (leading-none)
const ROWS = {
  "--rows": `calc(2 * ${PAD_Y} + 2px + ${SYMBOL_SIZE} + 0.375rem + 2.5 * ${LABEL_SIZE} + 0.25rem + ${FIGURE_SIZE})`,
  "--rows-xl": `calc(2 * ${PAD_Y} + 2px + max(${SYMBOL_SIZE}, 2.5 * ${LABEL_SIZE}) + 0.25rem + ${FIGURE_SIZE})`,
} as CSSProperties;
// The dots' radius, as the stats strip's 8px dots
const DOT_R = 4;

// trailing: the symbol comes after the name, on the right. split: a name followed by its symbol that
// wraps onto two lines on desktop anyway (beside its symbol there isn't room for it on one) is broken
// between its words, so its box is only as wide as the longer word and the symbol sits right after it
// rather than out at the box's edge.
type Item = {
  name: string;
  symbol: ComponentType<SVGProps<SVGSVGElement>>;
  figure?: string;
  centred?: boolean;
  trailing?: boolean;
  split?: boolean;
};

const Name = ({ name, split }: Pick<Item, "name" | "split">) => {
  const [first, ...rest] = name.split(" ");
  if (!split || !rest.length) return <>{name}</>;
  return (
    <>
      {first} <br className="hidden xl:inline" />
      {rest.join(" ")}
    </>
  );
};

export const PowerFlow = ({
  system,
  cards,
  links,
  geometry,
  figureRef,
}: {
  system: PowerSystem;
  cards: number;
  links: number;
  geometry: FlowGeometry | null;
  figureRef: Ref<HTMLElement>;
}) => {
  // The grid's name sits in the middle of its box; the others start on the left
  const items: Item[] = [
    { name: "Grid", symbol: GridIcon, centred: true },
    { name: system.inverterName, symbol: InverterIcon, figure: system.inverter },
    { name: "AC loads", symbol: AcIcon, trailing: true },
    { name: "Solar", symbol: SunIcon, figure: system.solar },
    { name: "Battery", symbol: BatteryIcon, figure: system.battery },
    { name: "Essential loads", symbol: EssentialIcon, trailing: true, split: true },
  ];
  const dots = (geometry?.wires ?? []).flatMap(({ start, end }) => [start, end]);

  return (
    <figure ref={figureRef} className="relative mt-6 [container-type:inline-size]">
      <figcaption className="sr-only">
        How the power flows: from the solar panels into the battery, from the grid and the battery into the
        inverter, and from the inverter out to the AC loads and the essential loads.
      </figcaption>
      {/* The boxes' fills and outlines, under their words */}
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
        {geometry?.frames.map((frame, k) => (
          <rect
            key={k}
            {...frame}
            rx={FLOW_RADIUS - 0.5}
            className="fill-[#1b2b40] dark:fill-brand-navy-deep"
            stroke={LINE_GREY}
            strokeWidth={1}
          />
        ))}
      </svg>
      <ul
        className="relative grid grid-cols-3 [grid-auto-rows:minmax(var(--rows),1fr)] xl:[grid-auto-rows:minmax(var(--rows-xl),1fr)]"
        style={{ ...GRID_GAPS, ...ROWS }}
      >
        {items.map(({ name, symbol: Glyph, figure, centred, trailing, split }) => (
          <li
            key={name}
            data-flow-box
            className={cn(
              "flex min-w-0 flex-col border border-transparent text-white shadow-[0_8px_18px_-8px_rgba(0,0,0,0.6)]",
              // A box with a figure has its name at the top and its figure at the bottom; a name on its
              // own sits in the middle
              figure ? "justify-between" : "justify-center",
              centred && "items-center text-center",
            )}
            style={{ ...BOX_PADDING, borderRadius: FLOW_RADIUS }}
          >
            {/* Symbol and name in reading order, symbol first unless it trails; on phones and tablets the
                symbol goes up into the box's top left corner, or top right when it trails */}
            <span
              className={cn(
                "flex gap-1.5 xl:flex-row xl:items-center xl:gap-2",
                trailing ? "flex-col-reverse" : "flex-col",
                centred ? "self-stretch items-center xl:justify-center" : "items-start",
              )}
            >
              {!trailing && <Glyph className="shrink-0 self-start text-white/70 xl:self-auto" style={SYMBOL} />}
              {figure ? (
                <span className="font-semibold uppercase leading-tight tracking-wider text-white/70" style={LABEL}>
                  <Name name={name} split={split} />
                </span>
              ) : (
                <span className="font-display font-bold uppercase leading-tight" style={NAME}>
                  <Name name={name} split={split} />
                </span>
              )}
              {trailing && <Glyph className="shrink-0 self-end text-white/70 xl:self-auto" style={SYMBOL} />}
            </span>
            {figure && (
              <span className="mt-1 font-display font-bold leading-none" style={FIGURE}>
                {figure}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
        <svg className="absolute inset-0 h-full w-full overflow-visible">
          {geometry?.wires.map(({ d }, k) => <path key={k} d={d} fill="none" stroke={LINE_GREY} strokeWidth={1} />)}
        </svg>
        {/* Separate svgs: CSS drop-shadow only applies to the outer svg element, and the grey lines and dots
            shouldn't glow. The dots go over the pulse, as the stats strip's do. */}
        <svg className="pulse-shine absolute inset-0 h-full w-full overflow-visible">
          {items.map((_, k) =>
            [0, 1].map((half) => {
              const trace = geometry?.boxes[k].halves[half];
              return (
                <PulseLayers key={`${k}-${half}`} d={trace?.d ?? ""} seg="card" index={cards + k} dash={trace?.dash ?? 0.2} />
              );
            }),
          )}
          {Array.from({ length: FLOW_WIRES }, (_, k) => (
            <PulseLayers
              key={`wire-${k}`}
              d={geometry?.wires[k].d ?? ""}
              seg="link"
              index={links + k}
              dash={geometry?.wires[k].dash ?? 0.2}
            />
          ))}
        </svg>
        <svg className="absolute inset-0 h-full w-full overflow-visible">
          {dots.map(([cx, cy], k) => (
            <circle key={k} cx={cx} cy={cy} r={DOT_R} fill={DOT_GREY} />
          ))}
        </svg>
        <svg className="pulse-shine absolute inset-0 h-full w-full overflow-visible">
          {Array.from({ length: FLOW_WIRES }, (_, k) =>
            (["start", "end"] as const).map((at) => {
              const [cx, cy] = geometry?.wires[k][at] ?? [0, 0];
              return <DotFlash key={`${k}-${at}`} index={links + k} at={at} cx={cx} cy={cy} r={DOT_R} />;
            }),
          )}
        </svg>
      </div>
    </figure>
  );
};
