import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { TitleSpace } from "./TitleSpace";

// Customers' Google reviews of Electrical Pro, in their own words (spelling and punctuation lightly
// tidied; long ones end at the last full sentence shown). The section stays hidden while this is empty.
// Put ==double equals signs== round the words to highlight, like a marker pen; a review can have more
// than one highlight.
const reviews: { quote: string; name: string }[] = [
  {
    quote:
      "Amazing service. They were able to help me in a rush when breaker broke. Thanks to the friendly experts at Electrical Pro, ==we didn't have to worry about going a night without power== because everything happened so late in the day. Even after service was provided, ==phoned to check up and ensure I'm happy== with the repair.",
    name: "Gerhard Homveld",
  },
  {
    quote:
      "==These guys helped me so much.== We had done an installation with another company here in George that gave us endless problems. We were really in serious trouble when we contacted Tim and his team. WOW. ==What a bunch of absolute professionals.==",
    name: "Elvis Blue",
  },
  {
    quote:
      "Thank you to Electrical Pro who worked with Garden Route Generator services to save the day — ==on a public holiday to get us up and running within a few hours.== We would recommend them to anyone. 5-star service.",
    name: "Nan Jameson",
  },
  {
    quote:
      "I had a wonderful experience with Electrical Pro, thanks to Vicky and Marishal. They were ==incredibly helpful when we had to book, cancel, and then rebook all within 24 hours.==",
    name: "Xane Lessing",
  },
  {
    quote:
      "These guys are so professional and so helpful, Tim and his team are absolutely amazing! ==They bend over backwards to assist and help!== I would HIGHLY RECOMMEND them! 10/10",
    name: "Candice Gruen",
  },
  {
    quote:
      "Excellent people and owners! ==If you want to get the job done right, choose Electrical Pro!==",
    name: "Johan Joubert",
  },
  {
    quote:
      "Possibly ==the most efficient, polite and expert service in the country== in the field as required by me.",
    name: "Peter Gibbs",
  },
  {
    quote:
      "Excellent service and ==professional installation== on camper, highly recommended.",
    name: "Paul Jones",
  },
  {
    quote:
      "Great people, ==feels like family.== Quick response and great working with them.",
    name: "The WiFi",
  },
  {
    quote: "Excellent service! ==Always happy to use them!==",
    name: "Sylvanus Retief",
  },
];

// A review's text with its ==highlights== marked, in the style of the reference the client chose (Basecamp's
// customer quotes): a highlighter-pen stroke behind the words (.highlighter in index.css), tight to the
// first and last letters. It covers each line's letters rather than the whole line, so a highlight running
// over several lines shows a thin gap between them, and each line's stroke starts strong again. The
// highlighted words are the site's dark navy in light mode (the headings' colour), darker than the grey
// round them, and white in dark mode, to stand out clearly on the stroke's strong blue.
const Highlighted = ({ text }: { text: string }) => (
  <>
    {text.split("==").map((part, k) =>
      k % 2 ? (
        <mark key={k} className="highlighter text-foreground dark:text-white">
          {part}
        </mark>
      ) : (
        <Fragment key={k}>{part}</Fragment>
      ),
    )}
  </>
);

// As in the reference: small, compact dark grey text in straight quotes, and the name under it in darker
// bold italics
const Review = ({ quote, name }: (typeof reviews)[number]) => (
  <figure>
    <blockquote className="text-sm leading-normal text-[#444848] dark:text-white/80">
      "<Highlighted text={quote} />"
    </blockquote>
    <figcaption className="mt-1.5 text-sm font-bold italic leading-snug text-[#2a2e2e] dark:text-white">
      –{name}
    </figcaption>
  </figure>
);

// The reviews drift slowly to the right in an endless loop, like the turning light of a fish-tank toy: two
// rows of them, in a strip as wide as the page that fades out on the right and back in on the left. The
// strip holds COPIES copies of the reviews and moves one copy's width a loop (drift-right in
// tailwind.config.ts), so the copies take each other's places without a seam; three cover screens up to
// about 2,500px wide. The mouse doesn't touch it: it never stops, and the pointer passes straight through
// to the section behind. Where the visitor's device asks for less motion it stays still, one copy you can
// scroll along.
const COPIES = 3;
const SPEED = 28; // px a second, slow enough to read as it goes

// The reviews go in pairs, one over the other, making the two rows: the longest with the shortest, the next
// longest with the next shortest and so on, so the pairs come out about as tall as each other and the rows
// fit together closely. Which of the two goes on top alternates; an odd one out goes on its own.
// How long a review is in letters, leaving out the ==highlight== marks
const size = (k: number) => reviews[k].quote.split("==").join("").length;

const PAIRS = (() => {
  const bySize = reviews.map((_, k) => k).sort((a, b) => size(b) - size(a));
  const pairs: number[][] = [];
  for (let i = 0, j = bySize.length - 1; i <= j; i++, j--) {
    const [long, short] = [bySize[i], bySize[j]];
    pairs.push(i === j ? [long] : pairs.length % 2 ? [short, long] : [long, short]);
  }
  return pairs;
})();

// How the pairs are set out along the strip: side by side with even gaps between them, and both reviews of a
// pair lined up on the left at the same width, the width that suits the longer one (so the heights differ
// less). Their tops follow a gentle wave, after a hand-drawn sketch: once along each copy, level for a pair
// or two, dipping DIP lower in the middle and rising again, so it runs on smoothly from one copy into the
// next. In px at desktop size; phones get SMALL of it.
const GAP = 40;
const ROW_GAP = 24;
const DIP = 32;
const SMALL = 0.82;
const natural = (k: number) => Math.min(300, Math.max(210, 210 + (size(k) - 35) * 0.32));
const widthsAt = (scale: number) => {
  const widths: number[] = [];
  for (const pair of PAIRS) {
    const width = Math.round(scale * Math.max(...pair.map(natural)));
    for (const k of pair) widths[k] = width;
  }
  return widths;
};
// Until the reviews are measured: about how tall each is at its width (14px text on 21px lines, and the name)
const estimate = (scale: number) => {
  const widths = widthsAt(scale);
  return reviews.map((_, k) => Math.ceil((size(k) * 7.2) / widths[k]) * 21 + 26);
};

// Where each review goes in one copy of the strip, from how tall each one is, and the copy's size. Every
// pair sits within its own stretch of the strip, so no review runs into the next copy and the loop is even.
const layOut = (heights: number[], scale: number) => {
  const widths = widthsAt(scale);
  const xs: number[] = [];
  let x = 0;
  for (const pair of PAIRS) {
    xs.push(x);
    x += widths[pair[0]] + GAP * scale;
  }
  const width = Math.round(x);
  // How far down the wave each pair's top is, from where the middle of the pair is along the copy, with the
  // highest at 0
  const dips = PAIRS.map((pair, i) => {
    const along = (xs[i] + widths[pair[0]] / 2) / width;
    return ((DIP * scale) / 2) * (1 - Math.cos(2 * Math.PI * along));
  });
  const highest = Math.min(...dips);
  const spots: { x: number; y: number }[] = [];
  PAIRS.forEach((pair, i) => {
    let y = dips[i] - highest;
    for (const k of pair) {
      spots[k] = { x: Math.round(xs[i]), y: Math.round(y) };
      y += heights[k] + ROW_GAP * scale;
    }
  });
  const height = Math.ceil(Math.max(...spots.map((s, k) => s.y + heights[k])));
  return { spots, widths, width, height };
};

export const Testimonials = () => {
  const scale = useMediaQuery("(min-width: 640px)") ? 1 : SMALL;
  const copyRef = useRef<HTMLDivElement>(null);

  // Each review's height at its width, measured from the first copy, and again whenever one changes (say
  // when the font arrives)
  const [heights, setHeights] = useState(() => estimate(scale));
  useLayoutEffect(() => {
    const copy = copyRef.current;
    if (!copy) return;
    const figures = reviews.map((_, k) => copy.querySelector<HTMLElement>(`[data-review="${k}"]`));
    const measure = () => {
      const next = figures.map((f, k) => f?.offsetHeight ?? estimate(scale)[k]);
      setHeights((prev) => (prev.every((h, k) => h === next[k]) ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    figures.forEach((f) => f && observer.observe(f));
    return () => observer.disconnect();
  }, [scale]);

  const layout = useMemo(() => layOut(heights, scale), [heights, scale]);
  if (reviews.length === 0) return null;

  return (
    // A band of its own in the light grey-blue (like Why Us), between the white Solar projects section and the
    // dark contact section
    // The title and reviews sit higher than the other sections' content, by about a tenth of the section's
    // height (64px, 70px on desktop), so the top padding is that much less than theirs (py-24 lg:py-32)
    <section className="pt-8 pb-24 lg:pt-[58px] lg:pb-32 bg-secondary">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <TitleSpace />
          {/* On phones, as every section title does (text-heading in tailwind.config.ts), it grows with the
              screen: this one just fills the width on one line */}
          <h2 className="font-display text-heading sm:text-5xl lg:text-7xl font-bold uppercase text-foreground text-balance">
            In our <span className="text-accent">clients' words</span>
          </h2>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]"
      >
        <div
          // The mouse passes straight through (see COPIES)
          className="pointer-events-none flex w-max animate-drift-right motion-reduce:animate-none"
          // A loop's length from the copy's width, so the speed is the same on any screen
          style={{ animationDuration: `${layout.width / SPEED}s` }}
        >
          {Array.from({ length: COPIES }, (_, copy) => (
            // Only the first copy is read out by screen readers
            <div
              key={copy}
              ref={copy === 0 ? copyRef : undefined}
              aria-hidden={copy > 0 || undefined}
              className={cn("relative shrink-0", copy > 0 && "motion-reduce:hidden")}
              style={{ width: layout.width, height: layout.height }}
            >
              {reviews.map((r, k) => (
                <div
                  key={k}
                  data-review={k}
                  className="absolute"
                  style={{ left: layout.spots[k].x, top: layout.spots[k].y, width: layout.widths[k] }}
                >
                  <Review {...r} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
