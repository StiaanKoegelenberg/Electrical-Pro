// Each page's tab title, search-result description and link-preview image. usePageMeta applies them in the
// browser. When the site is built, vite.config.ts also writes them into the <head> of index.html (the home
// page) and of a copy of it for every other page (solar.html and so on), so search engines and link
// previews in WhatsApp or Facebook see the right ones without running the app.
export const SITE_URL = "https://electricalpro.co.za";

export interface PageMeta {
  title: string;
  description: string;
  /** A photo in src/assets for the page's link preview. Without one, previews use public/og-image.jpg. */
  image?: string;
}

export const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "Electrical Pro | Garden Route Electrical Contractors & Solar",
    description:
      "Electrical Pro — three decades of expertise serving the Garden Route. Solar, commercial, agricultural & residential electrical services by Danny Farnham and Tim Toovey.",
  },
  "/solar": {
    title: "Solar power, built for the Garden Route | Electrical Pro",
    description:
      "From single-home rooftops to large commercial arrays, we design and install solar systems that lower bills, reduce reliance on the grid and keep working through load-shedding.",
    image: "service-solar.jpg",
  },
  "/commercial": {
    title: "Commercial electrical contracting | Electrical Pro",
    description:
      "Reliable, compliant electrical work for offices, retail, hospitality and industrial sites — delivered on time and to the highest safety standards.",
    image: "service-commercial.jpg",
  },
  "/agricultural": {
    title: "Electrical for farms & agri-businesses | Electrical Pro",
    description:
      "Specialist electrical services built for the realities of farm life — robust, weatherproof installations that keep dairies, irrigation and processing running.",
    image: "service-agricultural.jpg",
  },
  "/residential": {
    title: "Wiring your home for the future | Electrical Pro",
    description:
      "Safe, neat, certified residential electrical work — from small repairs to full home rewires, smart home installs and home solar.",
    image: "service-residential.jpg",
  },
  "/privacy": {
    title: "Privacy policy | Electrical Pro",
    description: "How Electrical Pro handles the personal information you share through this website, in line with POPIA.",
  },
};

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// index.html with its title, description, address and preview-image tags set to this page's. A tag that
// has gone missing from index.html stops the build, rather than shipping pages without it.
export function withPageHead(html: string, path: string, meta: PageMeta, imageUrl: string) {
  const url = SITE_URL + path;
  const fills: [RegExp, string][] = [
    [/(<title>)[^<]*(<\/title>)/, meta.title],
    [/(<meta name="description" content=")[^"]*(")/, meta.description],
    [/(<link rel="canonical" href=")[^"]*(")/, url],
    [/(<meta property="og:url" content=")[^"]*(")/, url],
    [/(<meta property="og:title" content=")[^"]*(")/, meta.title],
    [/(<meta property="og:description" content=")[^"]*(")/, meta.description],
    [/(<meta property="og:image" content=")[^"]*(")/, imageUrl],
    [/(<meta name="twitter:title" content=")[^"]*(")/, meta.title],
    [/(<meta name="twitter:description" content=")[^"]*(")/, meta.description],
    [/(<meta name="twitter:image" content=")[^"]*(")/, imageUrl],
  ];
  for (const [tag, value] of fills) {
    if (!tag.test(html)) throw new Error(`index.html is missing the tag ${tag}`);
    html = html.replace(tag, (_, start: string, end: string) => start + escape(value) + end);
  }
  return html;
}
