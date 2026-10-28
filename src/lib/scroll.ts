import type { MouseEvent } from "react";

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const TAKEOVER_EVENTS = ["wheel", "touchstart", "keydown"] as const;

let stopActive: (() => void) | null = null;

// Quick eased scroll to an element, honouring its scroll-margin-top. The target is re-read every
// frame, so images or fonts loading mid-scroll can't make it stop short or overshoot.
export const smoothScrollTo = (el: HTMLElement) => {
  stopActive?.();
  const targetY = () =>
    el.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, targetY());
    return;
  }

  const startY = window.scrollY;
  // Longer trips get a little more time, but even a full page stays under a second
  const duration = Math.min(850, 400 + Math.abs(targetY() - startY) * 0.06);
  const startTime = performance.now();
  let frame = 0;

  const stop = () => {
    cancelAnimationFrame(frame);
    TAKEOVER_EVENTS.forEach((type) => window.removeEventListener(type, stop));
    stopActive = null;
  };
  // The visitor scrolling or touching the screen takes over from the animation
  TAKEOVER_EVENTS.forEach((type) => window.addEventListener(type, stop, { passive: true }));
  stopActive = stop;

  const step = (now: number) => {
    const t = Math.min(1, (now - startTime) / duration);
    window.scrollTo(0, startY + (targetY() - startY) * easeInOutCubic(t));
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  frame = requestAnimationFrame(step);
};

// onClick for links to an #anchor: on the same page, glide there instead of jumping. Links to
// another page navigate as normal and the destination page does the glide (see pages/Index).
export const glideToHash = (e: MouseEvent<HTMLAnchorElement>) => {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab etc.
  const url = new URL(e.currentTarget.href, window.location.href);
  const target = url.hash ? document.getElementById(url.hash.slice(1)) : null;
  if (!target || url.pathname !== window.location.pathname) return;
  e.preventDefault();
  smoothScrollTo(target);
};
