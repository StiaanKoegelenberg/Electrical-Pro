import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, Sun, Building2, Tractor, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { glideToHash } from "@/lib/scroll";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { label: "Home", to: "/", icon: Zap },
  { label: "Solar", to: "/solar", icon: Sun },
  { label: "Commercial", to: "/commercial", icon: Building2 },
  { label: "Agricultural", to: "/agricultural", icon: Tractor },
  { label: "Residential", to: "/residential", icon: Home },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-smooth",
        scrolled || open
          ? "bg-brand-navy-deep/95 backdrop-blur-md shadow-elevated"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center group" aria-label="Electrical Pro home">
          <img
            src={logo}
            alt="Electrical Pro — Danny Farnham & Tim Toovey"
            className="h-10 sm:h-12 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <ThemeToggle className="mr-2 xl:mr-3" />
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "px-3 xl:px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-smooth rounded-md",
                pathname === l.to
                  ? "text-accent"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              )}
            >
              {l.label}
            </Link>
          ))}
          <Button asChild variant="hero" size="default" className="ml-2 xl:ml-3">
            <Link to="/#quote" onClick={glideToHash}>Get a Quote</Link>
          </Button>
        </nav>

        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="text-white p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        // Full-width list on phones; a dropdown card under the menu button on tablets
        <div className="lg:hidden bg-brand-navy-deep border-t border-white/10 md:absolute md:inset-x-0 md:top-full md:bg-transparent md:border-0 md:pointer-events-none">
          <div className="container py-4 md:pt-2 md:flex md:justify-end">
            <div className="flex flex-col gap-1 md:w-80 md:pointer-events-auto md:rounded-2xl md:border md:border-white/10 md:bg-brand-navy-deep/95 md:backdrop-blur-md md:p-3 md:shadow-elevated">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-lg transition-smooth",
                    pathname === l.to
                      ? "text-accent bg-white/5"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  )}
                >
                  <l.icon className="h-4 w-4 shrink-0 opacity-80" />
                  {l.label}
                </Link>
              ))}
              <Button asChild variant="hero" size="lg" className="mt-2">
                <Link
                  to="/#quote"
                  onClick={(e) => {
                    setOpen(false);
                    glideToHash(e);
                  }}
                >
                  Get a Quote
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
