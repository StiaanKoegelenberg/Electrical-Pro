import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { TitleSpace } from "@/components/site/TitleSpace";
import { usePageMeta } from "@/hooks/use-page-meta";

const NotFound = () => {
  usePageMeta("Page not found | Electrical Pro");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-center bg-gradient-dark pt-32 pb-20 lg:pt-44 lg:pb-32">
        <div className="container">
          <div className="max-w-2xl">
            <TitleSpace />
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold uppercase text-white text-balance">
              Page <span className="text-accent">not found</span>
            </h1>
            <p className="mt-6 text-lg text-white/80">
              This address doesn't exist or has moved. We've rebuilt our website, so an old link or
              bookmark may have brought you here.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/">
                  Back to Home <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outlineLight" size="lg">
                <Link to="/#quote">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
