import { useId } from "react";

// Drawn in a 280×48 box (the lg button height) so stroke widths aren't distorted; the main wave
// runs down the middle, with room either side for the bloom and echo ripples.
const W = 280;
const MID = W / 2;

// Two phases of an S-shaped curve centred on x = c with sideways swing a; morphing A→B→A
// makes the line ripple as it travels.
const wavePhases = (c: number, a: number) => {
  const tip = a / 4;
  const phaseA = `M ${c + tip} -10 C ${c - a} 4, ${c - a} 16, ${c} 24 C ${c + a} 32, ${c + a} 44, ${c - tip} 58`;
  const phaseB = `M ${c - tip} -10 C ${c + a} 4, ${c + a} 16, ${c} 24 C ${c - a} 32, ${c - a} 44, ${c + tip} 58`;
  return { d: phaseA, values: `${phaseA};${phaseB};${phaseA}` };
};

const MAIN = wavePhases(MID, 16);
const ECHO_BEHIND = wavePhases(MID - 36, 10);
const ECHO_AHEAD = wavePhases(MID + 36, 10);

const Ripple = ({ values, begin = "0s" }: { values: string; begin?: string }) => (
  <animate
    attributeName="d"
    values={values}
    dur="1.4s"
    begin={begin}
    repeatCount="indefinite"
    calcMode="spline"
    keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
  />
);

/** Wavy band of light that sweeps across its parent and back. Parent needs relative + overflow-hidden. */
export const WaveShine = () => {
  const id = useId().replace(/:/g, "");
  // Fixed filter areas: the default is sized from each curve's bounding box, which gets very
  // narrow mid-ripple and would cut the glow into a hard-edged box
  const area = { filterUnits: "userSpaceOnUse", x: -80, y: -60, width: W + 160, height: 168 } as const;

  return (
    <span aria-hidden="true" className="btn-shine pointer-events-none absolute inset-0">
      <svg
        viewBox={`0 0 ${W} 48`}
        preserveAspectRatio="none"
        // ! overrides Button's [&_svg]:size-4, which would shrink this to icon size
        className="absolute left-1/2 top-0 !h-full !w-[280px] -translate-x-1/2 overflow-visible"
      >
        <defs>
          <filter id={`${id}-bloom`} {...area}>
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id={`${id}-glow`} {...area}>
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id={`${id}-echo`} {...area}>
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <filter id={`${id}-core`} {...area}>
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* Broad bloom lighting the button well ahead of and behind the wave */}
        <path d={MAIN.d} fill="none" stroke="hsl(195 100% 80%)" strokeOpacity={0.32} strokeWidth={90} filter={`url(#${id}-bloom)`}>
          <Ripple values={MAIN.values} />
        </path>

        {/* Fainter echo ripples either side, slightly out of step with the main wave */}
        {[
          { wave: ECHO_BEHIND, begin: "-0.35s" },
          { wave: ECHO_AHEAD, begin: "-0.7s" },
        ].map(({ wave, begin }) => (
          <path
            key={begin}
            d={wave.d}
            fill="none"
            stroke="hsl(195 100% 88%)"
            strokeOpacity={0.5}
            strokeWidth={3}
            strokeLinecap="round"
            filter={`url(#${id}-echo)`}
          >
            <Ripple values={wave.values} begin={begin} />
          </path>
        ))}

        {/* Main wave: soft glow plus a bright core that follows the curve */}
        <path d={MAIN.d} fill="none" stroke="hsl(195 100% 78%)" strokeOpacity={0.6} strokeWidth={28} filter={`url(#${id}-glow)`}>
          <Ripple values={MAIN.values} />
        </path>
        <path d={MAIN.d} fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={4} strokeLinecap="round" filter={`url(#${id}-core)`}>
          <Ripple values={MAIN.values} />
        </path>
      </svg>
    </span>
  );
};
