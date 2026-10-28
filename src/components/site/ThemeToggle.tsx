import { useId } from "react";
import { flushSync } from "react-dom";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Sun rays as [x1, y1, x2, y2], one every 45° around the centre of a 24×24 icon
const RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return [6.5, 9].flatMap((r) => [12 + r * Math.sin(a), 12 - r * Math.cos(a)]);
});

const EASE = "transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)";

// One icon that morphs between a sun and a moon: the rays fold in, the disc grows,
// and a masking circle slides in from the top right to bite out the crescent
const SunMoon = ({ dark }: { dark: boolean }) => {
  const maskId = `moon-bite-${useId().replace(/:/g, "")}`;

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <circle
          cx="17"
          cy="7.5"
          r="7"
          fill="black"
          style={{ transform: dark ? "none" : "translate(9px, -9px)", transition: EASE }}
        />
      </mask>
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="currentColor"
        mask={`url(#${maskId})`}
        style={{
          transform: dark ? "none" : "scale(0.5)",
          transformBox: "fill-box",
          transformOrigin: "center",
          transition: EASE,
        }}
      />
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          opacity: dark ? 0 : 1,
          transform: dark ? "rotate(-45deg) scale(0.5)" : "none",
          transformBox: "fill-box",
          transformOrigin: "center",
          transition: EASE,
        }}
      >
        {RAYS.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
    </svg>
  );
};

// Light/dark switch for the navbar: lever on the left with a sun for light, on the right with a moon for dark.
// The page cross-fades between themes where the browser supports view transitions (see index.css).
export const ThemeToggle = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const toggle = (on: boolean) => {
    const apply = () => {
      document.documentElement.classList.toggle("dark", on);
      flushSync(() => setTheme(on ? "dark" : "light"));
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
    else apply();
  };

  return (
    <SwitchPrimitives.Root
      checked={dark}
      onCheckedChange={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "theme-toggle relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-white/30 bg-transparent transition-colors duration-500 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent data-[state=checked]:border-neutral-600",
        className
      )}
    >
      <SwitchPrimitives.Thumb className="pointer-events-none absolute left-0 top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-neutral-200 text-neutral-800 transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none data-[state=checked]:translate-x-5 data-[state=checked]:bg-neutral-700 data-[state=checked]:text-neutral-300">
        <SunMoon dark={dark} />
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  );
};
