import { motion } from "framer-motion";
import lancewoodImg from "@/assets/project-lancewood.jpg";
import nikwafloraImg from "@/assets/project-nikwaflora.jpg";

// Finished jobs, taken from the case studies on the old website. Only add figures the client has confirmed.
const projects = [
  {
    name: "Lancewood Dairy",
    setting: "Dairy farm",
    image: lancewoodImg,
    alt: "Rows of ground-mounted solar panels at Lancewood Dairy",
    specs: ["200 kWp solar", "200 kWh battery", "2 × 100 kW inverters"],
    summary:
      "The dairy used to fall back on a generator through load-shedding. Its milking machines, cooling and other equipment now run on a 200 kWp solar plant, with a Freedom Won battery storing the surplus and two Atess HPS100 inverters supplying the farm. The existing generator stays on as back-up and runs far less, cutting fuel and maintenance costs.",
  },
  {
    name: "Nikwaflora",
    setting: "Terranikwa flower farm, Outeniqua mountains",
    image: nikwafloraImg,
    alt: "Aerial view of solar panels on a shed roof at Terranikwa flower farm",
    specs: ["90 kW Victron inverters", "Fronius solar controllers", "Freedom Won batteries"],
    summary:
      "Terranikwa grows flowers on the southern slopes of the Outeniqua mountains and was facing high electricity bills and load-shedding. Its solar system cuts the farm's reliance on the grid, and the batteries carry production through outages and the night.",
  },
];

export const Projects = () => {
  return (
    <section id="projects" className="py-24 lg:py-32 bg-background">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong mb-3">
            Our work
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-foreground text-balance">
            Solar that keeps <span className="text-accent">farms running</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Two of our agricultural solar installations, built to keep working farms going through
            load-shedding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((p, i) => (
            <motion.article
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
            >
              <img
                src={p.image}
                alt={p.alt}
                loading="lazy"
                width={1200}
                height={675}
                className="aspect-video w-full object-cover"
              />
              <div className="p-6 lg:p-8">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {p.setting}
                </div>
                <h3 className="mt-2 font-display text-3xl font-bold uppercase text-foreground">{p.name}</h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.specs.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-foreground"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-muted-foreground leading-relaxed">{p.summary}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
