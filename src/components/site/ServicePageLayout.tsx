import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ContactSection } from "./ContactSection";

interface ServicePageLayoutProps {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  offerings: string[];
  rentals?: string[];
  body: string;
  accent?: string;
}

export const ServicePageLayout = ({
  eyebrow,
  title,
  intro,
  image,
  offerings,
  rentals,
  body,
}: ServicePageLayoutProps) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={image} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-deep via-brand-navy-deep/80 to-brand-navy-deep/30" />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">
              {eyebrow}
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold uppercase text-white text-balance">
              {title}
            </h1>
            <p className="mt-6 text-lg text-white/80">{intro}</p>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="py-20 lg:py-28">
        <div className="container grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3">
              About this service
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-foreground text-balance">
              Built around your needs
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {body}
            </p>
            <Button asChild variant="hero" size="lg" className="mt-8">
              <a href="#quote">Request a Quote <ArrowRight className="ml-1 h-5 w-5" /></a>
            </Button>
          </div>

          <div className="bg-secondary rounded-2xl p-8 lg:p-10 border border-border">
            <div className="font-display text-xl font-bold uppercase text-foreground mb-6">
              What we offer
            </div>
            <ul className="space-y-4">
              {offerings.map((o) => (
                <li key={o} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-electric mt-0.5">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-foreground">{o}</span>
                </li>
              ))}
            </ul>
            {rentals && rentals.length > 0 && (
              <>
                <div className="mt-8 font-display text-lg font-bold uppercase text-foreground">
                  Rentals:
                </div>
                <ul className="mt-4 space-y-4">
                  {rentals.map((r) => (
                    <li key={r} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-electric mt-0.5">
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-foreground">{r}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
              Need something not listed?{" "}
              <Link to="/#quote" className="text-accent font-semibold hover:underline">
                Just ask →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  );
};
