import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

// Cloudflare Turnstile, the contact form's check that a person is sending it rather than a bot. Most
// visitors never see it: it only shows a tick box when Cloudflare isn't sure. It puts its pass (a token)
// into the form as a hidden field named cf-turnstile-response, which /api/contact checks with Cloudflare.
//
// The site key is public (it's in the page either way); the matching secret key is a setting in Azure.
// Set VITE_TURNSTILE_SITE_KEY in .env.production to the widget's site key from the Cloudflare
// dashboard. Until then this uses Cloudflare's test key, which always passes, so the form works for testing
// with the test secret key (1x0000000000000000000000000000000AA) in Azure but stops no bots.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000BB";
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Widget = string;
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => Widget;
      reset: (widget: Widget) => void;
      remove: (widget: Widget) => void;
      getResponse: (widget: Widget) => string | undefined;
    };
  }
}

// The script loads once, the first time a form needs it
let loading: Promise<void> | null = null;
const loadScript = () =>
  (loading ??= new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve();
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error("Turnstile didn't load"));
    };
    document.head.appendChild(script);
  }));

export type TurnstileHandle = {
  // Whether the visitor has passed, so the form can wait rather than send something bound to be turned away
  passed: () => boolean;
  // A pass only works once, so the form asks for a fresh one after each send
  reset: () => void;
};

export const Turnstile = forwardRef<TurnstileHandle>((_, ref) => {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<Widget | null>(null);
  // Whether Cloudflare is showing its tick box, which then needs some room
  const [asking, setAsking] = useState(false);

  useImperativeHandle(ref, () => ({
    passed: () => !!(widget.current && window.turnstile?.getResponse(widget.current)),
    reset: () => {
      if (widget.current) window.turnstile?.reset(widget.current);
    },
  }));

  useEffect(() => {
    let gone = false;
    loadScript()
      .then(() => {
        if (gone || !box.current || !window.turnstile) return;
        widget.current = window.turnstile.render(box.current, {
          sitekey: SITE_KEY,
          theme: "dark",
          size: "flexible",
          appearance: "interaction-only",
          "before-interactive-callback": () => setAsking(true),
          "after-interactive-callback": () => setAsking(false),
        });
      })
      // Blocked or offline: the send then fails with the "please phone or email" message
      .catch(() => {});
    return () => {
      gone = true;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, []);

  // Takes no room until Cloudflare asks the visitor to tick the box
  return <div ref={box} className={asking ? "mt-4" : undefined} />;
});
Turnstile.displayName = "Turnstile";
