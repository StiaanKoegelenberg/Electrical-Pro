import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import featuredImg from "@/assets/featured-solar.jpg";

export const FeaturedProject = () => {
  return (
    <section className="relative py-24 lg:py-32 bg-brand-navy-deep overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <img
          src={featuredImg}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-deep via-brand-navy-deep/90 to-brand-navy-deep/40" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">
              Featured
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-white text-balance">
              Solar built for the <span className="text-accent">Garden Route sun</span>
            </h2>
            <p className="mt-6 text-lg text-white/80 max-w-xl">
              From single-home rooftop systems to large commercial arrays, our EP
              Solar division designs and installs grid-tied and hybrid systems
              that pay for themselves and keep the lights on.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6 max-w-xs">
              {[
                ["Tier-1", "Panels"],
                ["Hybrid", "& Backup"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="font-display text-2xl font-bold text-accent">{k}</div>
                  <div className="text-xs uppercase tracking-wider text-white/60 mt-1">{v}</div>
                </div>
              ))}
            </div>
            <Button asChild variant="hero" size="lg" className="mt-10">
              <Link to="/solar">
                Explore EP Solar <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
