import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { TitleSpace } from "@/components/site/TitleSpace";
import { usePageMeta } from "@/hooks/use-page-meta";
import { EMAIL, PHONE } from "@/lib/contact";
import { PAGE_META } from "@/lib/page-meta";
import { smoothScrollTo } from "@/lib/scroll";

// Based on the old website's POPIA statement, rewritten to match what this site actually collects. The
// client should read it before launch, and it needs updating if the site ever adds analytics, cookies or
// other outside services.

const Section = ({ id, title, children }: { id?: string; title: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-28">
    <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-foreground">{title}</h2>
    <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">{children}</div>
  </section>
);

const linkClass = "font-semibold text-accent-strong hover:underline";

const Privacy = () => {
  const { title, description } = PAGE_META["/privacy"];
  usePageMeta(title, description);
  const { hash } = useLocation();

  // Old /disclaimer links arrive at #disclaimer; everything else starts at the top
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) smoothScrollTo(target);
    else window.scrollTo(0, 0);
  }, [hash]);

  const email = (
    <a href={`mailto:${EMAIL}`} className={linkClass}>
      {EMAIL}
    </a>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="bg-gradient-dark pt-32 pb-16 lg:pt-44 lg:pb-20">
          <div className="container">
            <div className="max-w-3xl">
              <TitleSpace />
              <h1 className="font-display text-5xl sm:text-6xl font-bold uppercase text-white text-balance">
                Privacy policy
              </h1>
              <p className="mt-6 text-lg text-white/80">
                How we handle the personal information you share with us through this website, in line with
                the Protection of Personal Information Act (POPIA).
              </p>
              <p className="mt-4 text-sm text-white/60">Last updated November 2026</p>
            </div>
          </div>
        </section>

        <div className="container py-16 lg:py-24">
          <div className="max-w-3xl space-y-12">
            <Section title="What we collect">
              <p>
                When you send an enquiry through the form on this website, we receive what you enter: your
                name, email address, phone number if you give it, the service you're interested in and your
                message. If you phone or email us, we receive the details you share with us then.
              </p>
              <p>
                The website doesn't use cookies, analytics or advertising trackers. It remembers whether you
                chose light or dark mode in your own browser, and that setting never leaves your device.
              </p>
              <p>
                To show the website's fonts, your browser downloads them from Google Fonts, so Google receives
                your IP address. Our hosting provider also keeps standard server logs, such as IP addresses and
                the pages requested, to keep the site secure and running.
              </p>
              <p>
                To keep spam out, the enquiry form uses Cloudflare Turnstile, which checks that a person rather
                than a bot is sending it. To do that, Cloudflare receives your IP address and some technical
                details about your browser. It isn't used for advertising.
              </p>
            </Section>

            <Section title="How we use it">
              <p>
                Only to deal with your enquiry: to answer your questions, prepare a quote and arrange any work
                you ask us to do. We don't sell, rent or share your information, except where the law requires
                us to or where it's needed to provide a service you've asked for.
              </p>
            </Section>

            <Section title="How we keep it">
              <p>
                Enquiries from the form are sent by email to our office, through an email delivery service
                (Resend); the website itself doesn't store them.
                We take reasonable steps to protect your information against loss and unauthorised access, and
                keep it only for as long as we need it for the reason you gave it to us, or as the law requires.
              </p>
            </Section>

            <Section title="Your rights">
              <p>
                Under POPIA you can ask to see the personal information we hold about you, ask us to correct or
                delete it, and object to us using it. Email {email} and we'll respond.
              </p>
              <p>
                If you're unhappy with how we've handled your information, you can complain to the{" "}
                <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Information Regulator
                </a>
                .
              </p>
            </Section>

            <Section id="disclaimer" title="Website disclaimer">
              <p>
                The information on this website is provided in good faith for general information only. We work
                to keep it accurate and up to date, but we make no warranty that it is complete or correct, and
                we aren't liable for any loss arising from reliance on it.
              </p>
            </Section>

            <Section title="Changes and questions">
              <p>
                We may update this policy from time to time; the current version is always on this page. For
                any question about it, email {email} or call{" "}
                <a href={PHONE.href} className={linkClass}>
                  {PHONE.display}
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
