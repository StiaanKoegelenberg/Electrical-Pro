import type { ReactNode, SVGProps } from "react";

// The power-flow diagram's symbols (PowerFlow.tsx): the ones the client chose, simplified and redrawn as
// 1px lines on a 20px grid, the size they're shown at on desktop, so their straight lines land on whole
// pixels and stay sharp. Details too small to make out at that size (the pylon's extra bracing, the
// inverter's buttons, the outlined bolts) are left out. They take the colour of the text round them.

type IconProps = SVGProps<SVGSVGElement>;

const Icon = ({
  children,
  grid = 20,
  weight = 1,
  ...props
}: IconProps & { children: ReactNode; grid?: number; weight?: number }) => (
  <svg
    viewBox={`0 0 ${grid} ${grid}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={weight}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

// A pylon with two straight cross-arms and its lower legs braced, and a lightning bolt beside it
export const GridIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5.5 1.5 H8.5 M5.5 1.5 L2.5 18.5 M8.5 1.5 L11.5 18.5 M1.5 4.5 H12.5 M0.5 9.5 H13.5 M4.1 9.5 L11.5 18.5 M9.9 9.5 L2.5 18.5 M1 18.5 H4 M10 18.5 H13 M18.5 0.5 L15.5 5.5 H18.5 L15.5 10.5" />
  </Icon>
);

// A wall-mounted inverter: its case, a screen with a line under it, and a band across the bottom
export const InverterIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="0.5" width="13" height="19" rx="2" />
    <rect x="6.5" y="3.5" width="7" height="5" rx="1" />
    <path d="M7.5 11.5 H12.5 M3.5 15.5 H16.5" />
  </Icon>
);

// An upright battery with a lightning bolt in it
export const BatteryIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7.5 2.5 V0.5 H12.5 V2.5" />
    <rect x="4.5" y="2.5" width="11" height="17" rx="2" />
    <path d="M11 5.5 L8.5 10.5 H11.5 L9 15.5" />
  </Icon>
);

// The AC sign: a sine wave over a broken line
const AC_WAVE =
  "M0.5 8.5 C0.5 5.75 2.9 4.5 5.5 4.5 C8 4.5 9 6.8 10 8.5 C11 10.2 12.2 12.5 14.5 12.5 C17 12.5 19.5 11.3 19.5 8.5 M0.5 16.5 H8 M12 16.5 H19.5";

export const AcIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d={AC_WAVE} />
  </Icon>
);

// The AC sign with an exclamation mark at its top right, as on the Victron display's essential loads. The
// mark is drawn 2px thick, heavier than the rest, so it stands out, and set in from the edge and raised
// (its top a little past the symbol's square, hence overflow) so its dot sits clear above the wave's end.
export const EssentialIcon = (props: IconProps) => (
  <Icon {...props} overflow="visible">
    <path d={AC_WAVE} />
    <path d="M16 -1.5 V2.25" strokeWidth={2} />
    <circle cx="16" cy="5.5" r="1.1" fill="currentColor" stroke="none" />
  </Icon>
);

// lucide's sun, on its own 24px grid, as it was
export const SunIcon = (props: IconProps) => (
  <Icon grid={24} weight={1.35} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41" />
  </Icon>
);
