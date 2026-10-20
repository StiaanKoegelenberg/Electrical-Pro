import { motion, type Variants } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-building.jpg";
import { trackSpotlight } from "@/lib/spotlight";

// Headline lines glide in from the left one after another, like items on a conveyor
const slideIn: Variants = {
  hidden: { opacity: 0, x: -160 },
  show: (i: number) => {
    const delay = 0.2 + i * 0.18;
    return {
      opacity: 1,
      x: 0,
      transition: {
        x: { delay, duration: 1.1, ease: [0.25, 0.8, 0.3, 1] },
        opacity: { delay, duration: 0.8, ease: "easeOut" },
      },
    };
  },
};

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Electrical Pro headquarters at golden hour"
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-brand-navy-deep/40" />
      </div>

      <div className="container relative z-10 pt-24 pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-1.5 mb-6"
          >
            <span className="h-2 w-2 rounded-full bg-accent shadow-glow animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              Garden Route · Est. 1990s
            </span>
          </motion.div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold uppercase leading-[0.95] text-white text-balance">
            <motion.span custom={0} variants={slideIn} initial="hidden" animate="show" className="block">
              Three decades of expertise.
            </motion.span>
            <motion.span
              custom={1}
              variants={slideIn}
              initial="hidden"
              animate="show"
              className="block bg-gradient-electric bg-clip-text text-transparent"
            >
              Lighting the way forward.
            </motion.span>
          </h1>

          <motion.p
            custom={2}
            variants={slideIn}
            initial="hidden"
            animate="show"
            className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed"
          >
            Trusted electrical contractors serving the Garden Route across solar,
            commercial, agricultural and residential projects — built on quality,
            safety and three decades of experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button asChild variant="hero" size="xl">
              <a href="#quote" onMouseMove={trackSpotlight} className="group relative">
                Get a Free Quote <ArrowRight className="ml-1 h-5 w-5" />
                <span className="spotlight-border pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 [--spot-color:0_0%_100%] [--spot-size:90px]" />
              </a>
            </Button>
            <Button asChild variant="outlineLight" size="xl">
              <a href="#services" onMouseMove={trackSpotlight} className="group relative">
                <Phone className="mr-1 h-5 w-5" /> Our Services
                <span className="spotlight-border pointer-events-none absolute -inset-[2px] rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 [--spot-color:0_0%_100%] [--spot-size:90px]" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
