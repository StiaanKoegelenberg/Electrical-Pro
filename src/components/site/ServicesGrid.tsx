import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sun, Building2, Tractor, Home } from "lucide-react";
import solarImg from "@/assets/service-solar.jpg";
import commercialImg from "@/assets/service-commercial.jpg";
import agriImg from "@/assets/service-agricultural.jpg";
import agriVideo from "@/assets/agricultural.mp4.asset.json";
import residentialImg from "@/assets/service-residential.jpg";
import { trackSpotlight } from "@/lib/spotlight";

const services = [
  {
    title: "EP Solar",
    icon: Sun,
    image: solarImg,
    blurb:
      "Cutting-edge solar solutions harnessing Garden Route sunshine for sustainable energy independence.",
    to: "/solar",
    accent: "from-amber-500/80 to-orange-600/80",
  },
  {
    title: "Commercial",
    icon: Building2,
    image: commercialImg,
    blurb:
      "Expert electrical contracting for commercial projects — reliable, high-quality and efficient service.",
    to: "/commercial",
    accent: "from-sky-500/80 to-blue-700/80",
  },
  {
    title: "Agricultural",
    icon: Tractor,
    image: agriImg,
    video: agriVideo.url,
    blurb:
      "Specialised electrical services for farms and agri-businesses — efficient, reliable and safe.",
    to: "/agricultural",
    accent: "from-emerald-500/80 to-green-700/80",
  },
  {
    title: "Residential",
    icon: Home,
    image: residentialImg,
    blurb:
      "Reliable, safe residential electrical work — wiring your home for the future.",
    to: "/residential",
    accent: "from-rose-500/80 to-red-700/80",
  },
];

export const ServicesGrid = () => {
  return (
    <section id="services" className="py-24 lg:py-32 bg-background">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">
            What we do
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-foreground text-balance">
            Specialist services across <span className="text-accent">four sectors</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            From rooftop solar to industrial fit-outs, we bring three decades of
            experience to every project we take on.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onMouseMove={trackSpotlight}
              className="group relative rounded-2xl"
            >
              <Link
                to={s.to}
                className="block relative overflow-hidden rounded-2xl shadow-card hover:shadow-elevated transition-smooth h-[420px]"
              >
                {s.video ? (
                  <video
                    src={s.video}
                    poster={s.image}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-smooth duration-700"
                  />
                ) : (
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-smooth duration-700"
                  />
                )}
                <div className={`absolute inset-0 bg-gradient-to-t ${s.accent} mix-blend-multiply opacity-60 group-hover:opacity-40 transition-smooth`} />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-deep via-brand-navy-deep/40 to-transparent" />

                <div className="relative h-full flex flex-col justify-end p-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                    <s.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display text-3xl lg:text-4xl font-bold uppercase text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-white/80 max-w-md">{s.blurb}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent group-hover:gap-3 transition-smooth">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>

              {/* Outside the Link's overflow-hidden so the edge glow can bloom past the card */}
              <div className="spotlight-border pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
