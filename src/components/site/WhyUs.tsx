import { motion } from "framer-motion";
import { ShieldCheck, Award, MapPin, Wrench } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "30+ Years Experience",
    desc: "Three decades of solving complex electrical challenges across the Garden Route.",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    desc: "Fully certified and COC compliant work.",
  },
  {
    icon: Wrench,
    title: "End-to-End Service",
    desc: "From design and supply to installation and aftercare — one trusted team.",
  },
  {
    icon: MapPin,
    title: "Local Garden Route",
    desc: "Born and based here. Fast response times and deep community roots.",
  },
];

export const WhyUs = () => {
  return (
    <section className="py-24 lg:py-32 bg-secondary">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">
              Why Electrical Pro
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-foreground text-balance">
              Built on trust. <br />
              <span className="text-accent">Powered by craft.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              When you work with Electrical Pro, you're working with a team that
              treats your project like their own. We deliver work that's safe,
              compliant, and built to last.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-background rounded-xl p-6 shadow-card border border-border hover:shadow-elevated hover:-translate-y-1 transition-smooth"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-electric shadow-glow mb-4">
                  <f.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
