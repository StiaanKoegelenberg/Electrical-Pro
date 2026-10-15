import { motion } from "framer-motion";

const stats = [
  { value: "30+", label: "Years of Experience" },
  { value: "10\u00A0000+", label: "Projects Completed" },
  { value: "4", label: "Specialist Sectors" },
  { value: "100%", label: "Garden Route Local" },
];

export const Stats = () => {
  return (
    <section className="bg-brand-navy-deep border-y border-white/5">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-5xl lg:text-6xl font-bold bg-gradient-electric bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/60">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
