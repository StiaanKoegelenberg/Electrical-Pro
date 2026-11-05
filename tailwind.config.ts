import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ['"Big Shoulders Display"', '"Arial Narrow"', "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        // Buttons keep the site's original Inter; index.html loads only the weight they use (600)
        button: ['"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        // Section titles on phones (text-heading sm:text-5xl lg:text-7xl): they grow with the screen, from 36px
        // on the smallest to their tablet size of 48px from about 430px wide. Sized so "In our clients' words"
        // just fills the width on one line (it's 7.43 times as wide as its font size; the container's
        // padding is 48px in all)
        heading: ["clamp(2.25rem, calc((100vw - 48px) / 7.6), 3rem)", { lineHeight: "1" }],
        // The other section titles, a fifth larger than those at every size (text-heading-lg sm:text-[3.6rem]
        // lg:text-[5.4rem]): all but "Solar projects" and "In our clients' words"
        "heading-lg": ["clamp(2.7rem, calc((100vw - 48px) / 7.6 * 1.2), 3.6rem)", { lineHeight: "1" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          glow: "hsl(var(--accent-glow))",
          strong: "hsl(var(--accent-strong))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
        },
        brand: {
          navy: "hsl(var(--brand-navy))",
          "navy-deep": "hsl(var(--brand-navy-deep))",
          "navy-soft": "hsl(var(--brand-navy-soft))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // The reviews' strip (Testimonials.tsx), which holds three copies of the reviews: rightwards by
        // one copy's width, so each copy ends where the next began and the loop has no seam
        "drift-right": {
          from: { transform: "translateX(calc(-100% / 3))" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) both",
        // Its length is set on the strip itself, from its width, to keep a steady speed
        "drift-right": "drift-right 60s linear infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
