import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { smoothScrollTo } from "@/lib/scroll";
import { usePageMeta } from "@/hooks/use-page-meta";
import { PAGE_META } from "@/lib/page-meta";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { ServicesGrid } from "@/components/site/ServicesGrid";
import { WhyUs } from "@/components/site/WhyUs";
import { FeaturedProject } from "@/components/site/FeaturedProject";
import { Projects } from "@/components/site/Projects";
import { Testimonials } from "@/components/site/Testimonials";
import { ContactSection } from "@/components/site/ContactSection";
import { Footer } from "@/components/site/Footer";

const Index = () => {
  const { hash } = useLocation();
  usePageMeta(PAGE_META["/"].title, PAGE_META["/"].description);

  // The browser looks for #anchors before React renders, so glide to them ourselves
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) smoothScrollTo(target);
  }, [hash]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <ServicesGrid />
        <WhyUs />
        <FeaturedProject />
        <Projects />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
