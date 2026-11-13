import { writeFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { PAGE_META, SITE_URL, withPageHead } from "./src/lib/page-meta";

// Puts each page's title, description and preview image (src/lib/page-meta.ts) into the HTML itself:
// index.html gets the home page's, and every other page gets its own copy of index.html (solar.html and
// so on), which .htaccess and _redirects serve at /solar etc. Search engines and link previews then see
// the right ones without running the app.
const pageHeads = (): Plugin => ({
  name: "page-heads",
  transformIndexHtml: (html) => withPageHead(html, "/", PAGE_META["/"], `${SITE_URL}/og-image.jpg`),
  writeBundle({ dir }, bundle) {
    const index = bundle["index.html"];
    if (!dir || index?.type !== "asset") return;
    for (const [page, meta] of Object.entries(PAGE_META)) {
      if (page === "/") continue;
      const image = Object.values(bundle).find((file) => file.type === "asset" && !!meta.image && file.names.includes(meta.image));
      if (meta.image && !image) throw new Error(`page-meta.ts: ${meta.image} isn't used by the app, so it has no address`);
      const imageUrl = image ? `${SITE_URL}/${image.fileName}` : `${SITE_URL}/og-image.jpg`;
      writeFileSync(path.join(dir, `${page.slice(1)}.html`), withPageHead(String(index.source), page, meta, imageUrl));
    }
  },
});

// Keeps every build except the live site's out of search engines: staging, pull request previews, the
// Cloudflare preview and local builds all get a noindex tag in every page. Only a build with
// SITE_ENV=production (set by the Azure workflow for the main branch) leaves it out.
const noindexUnlessProduction = (): Plugin => ({
  name: "noindex-unless-production",
  transformIndexHtml: (html) =>
    process.env.SITE_ENV === "production"
      ? html
      : html.replace("</head>", `  <meta name="robots" content="noindex, nofollow" />\n  </head>`),
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), noindexUnlessProduction(), pageHeads(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
