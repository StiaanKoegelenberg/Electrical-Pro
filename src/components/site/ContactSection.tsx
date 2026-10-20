import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { WaveShine } from "./WaveShine";

export const ContactSection = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast({
        title: "Thanks — we'll be in touch!",
        description: "Your message has been received. Expect a reply within 1 business day.",
      });
      (e.target as HTMLFormElement).reset();
      setSubmitting(false);
    }, 600);
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-gradient-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(hsl(var(--accent)) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">
              Get in touch
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase text-white text-balance">
              Let's power your <span className="text-accent">next project</span>
            </h2>
            <p className="mt-6 text-lg text-white/70">
              Tell us about your project and we'll come back with a clear,
              honest quote — no obligation.
            </p>

            <div className="mt-10 space-y-5">
              {[
                { icon: Phone, label: "Call us", value: "+27 (0) 44 000 0000" },
                { icon: Mail, label: "Email", value: "info@electricalpro.co.za" },
                { icon: MapPin, label: "Location", value: "Garden Route, South Africa" },
                { icon: Clock, label: "Hours", value: "Mon–Fri 07:30 – 17:00" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                    <c.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/50">{c.label}</div>
                    <div className="text-white font-medium mt-0.5">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-8 flex items-center gap-4 rounded-xl border border-accent/60 bg-accent/5 p-4 shadow-glow"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/10">
                <Zap className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold uppercase tracking-wider text-accent">
                  24 Hour Emergency Services
                </div>
                <p className="mt-1 text-sm text-white/80 leading-snug">
                  Available 24/7 — we're here when you need us most.
                </p>
              </div>
              <div
                className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-accent text-accent"
                aria-hidden="true"
              >
                <div className="text-center leading-none">
                  <div className="font-display text-sm font-bold">24</div>
                  <div className="text-[8px] font-semibold uppercase tracking-wider">Hours</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.form
            id="quote"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="scroll-mt-28 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-elevated"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/60 mb-2 block">Name</label>
                <Input required className="bg-white/5 border-white/15 text-white placeholder:text-white/30" placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/60 mb-2 block">Phone</label>
                <Input className="bg-white/5 border-white/15 text-white placeholder:text-white/30" placeholder="+27 ..." />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs uppercase tracking-wider text-white/60 mb-2 block">Email</label>
              <Input required type="email" className="bg-white/5 border-white/15 text-white placeholder:text-white/30" placeholder="you@email.com" />
            </div>
            <div className="mt-4">
              <label className="text-xs uppercase tracking-wider text-white/60 mb-2 block">Service</label>
              <select className="flex h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white">
                <option className="bg-brand-navy-deep">EP Solar</option>
                <option className="bg-brand-navy-deep">Commercial</option>
                <option className="bg-brand-navy-deep">Agricultural</option>
                <option className="bg-brand-navy-deep">Residential</option>
                <option className="bg-brand-navy-deep">Other / Not sure</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="text-xs uppercase tracking-wider text-white/60 mb-2 block">Message</label>
              <Textarea required rows={5} className="bg-white/5 border-white/15 text-white placeholder:text-white/30" placeholder="Tell us about your project..." />
            </div>
            <Button type="submit" variant="hero" size="lg" className="relative mt-6 w-full overflow-hidden" disabled={submitting}>
              {submitting ? "Sending..." : <>Send Message <Send className="ml-1 h-4 w-4" /></>}
              <WaveShine />
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};
