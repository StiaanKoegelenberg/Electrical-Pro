# Electrical Pro website

Marketing site for Electrical Pro (electricalpro.co.za), an electrical contractor in the Garden Route. It's a React + Vite + Tailwind single-page app, first built in Lovable.

## Working on it

```sh
npm ci          # install the exact versions in package-lock.json
npm run dev     # http://localhost:8080
npm test
npm run build   # production build into dist/
```

## Where things live

- Pages are in `src/pages/`. The four service pages share `src/components/site/ServicePageLayout.tsx`.
- Each page's tab title, search description and link-preview image: `src/lib/page-meta.ts`. The build writes them into the HTML of every page (`solar.html` and so on), so link previews and search engines get them too.
- Phone and email: `src/lib/contact.ts`. Hours and location are written out in `ContactSection.tsx` and `Footer.tsx`. The phone number and hours are also in the business details for Google at the bottom of `index.html`'s `<head>`.
- Projects: the list at the top of `src/components/site/Projects.tsx`.
- Privacy policy: `src/pages/Privacy.tsx`. Update it if the site ever adds analytics, cookies or other outside services.
- Testimonials: the list at the top of `src/components/site/Testimonials.tsx`. The section stays hidden until it has real quotes.
- Everything saved from the old WordPress site (job photos, the logo source, videos, and each page's text) is in `old-site-media/`, which isn't committed to git.
- Adding a page means adding its route in `src/App.tsx`, its title and description in `src/lib/page-meta.ts`, its address in both page lists in `public/.htaccess` and in `public/_redirects`, and a line in `public/sitemap.xml`.

## Contact form

The form posts to `/api/contact`, an Azure function in `api/` (the logic is in `api/src/enquiry.js`, tested in `src/test/enquiry.test.ts`). It checks the visitor passed Cloudflare Turnstile (`src/components/site/Turnstile.tsx`), plus a hidden field bots fill in and a "sent too fast" check, then emails the enquiry to `info@electricalpro.co.za` through Resend, with the customer as reply-to. It only runs on Azure, so locally every send shows the "didn't send" message.

Its keys are settings on the Static Web App in the Azure portal (Settings → Environment variables), never in the code: `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, and optionally `CONTACT_TO` and `CONTACT_FROM` (see the top of `api/src/enquiry.js`). The Turnstile site key, which is public, goes in `.env.production` as `VITE_TURNSTILE_SITE_KEY`. Send a test enquiry after any change and check it arrives: if a setting is missing or Resend refuses, the form shows the "didn't send, please phone or email" message and the function logs why.

## Deploying

The site is an Azure Static Web App (`electricalpro-preview`, Free plan, resource group `electricalpro-rg`), deployed by the GitHub Actions workflows in `.github/workflows/`. Its settings (page addresses, the API's Node version, caching) are in `public/staticwebapp.config.json`.

| Stage | Branch | Address |
|---|---|---|
| Dev | your own branch, or `npm run dev` | `http://localhost:8080`, plus a temporary preview address on each pull request (posted on the pull request) |
| Staging | `dev` | `https://happy-flower-09933630f-dev.eastus2.3.azurestaticapps.net` |
| Production | `main` | `https://happy-flower-09933630f.3.azurestaticapps.net`, and `electricalpro.co.za` once the domain points there |

To release:

1. Work on `dev` (or on a branch off it, merged into `dev` by pull request) and push. Staging updates in a couple of minutes.
2. Check it on the staging address.
3. On GitHub, open a pull request from `dev` into `main`. Once the Tests check passes, merge it, and production updates. `main` doesn't accept direct pushes.

Only production is built with `SITE_ENV=production`. Every other build, including local ones and the Cloudflare preview, has a noindex tag in every page so search engines leave it alone (`vite.config.ts`).

Each environment has its own settings in the Azure portal (Settings → Environment variables, then pick the environment). Staging's contact form sends to a test address (`CONTACT_TO`), so test enquiries don't reach the office. Pull request previews have no settings, so their contact form shows the "didn't send" message. Every address the form runs on has to be listed as a hostname on the Turnstile widget in Cloudflare.

The Cloudflare Pages preview (`electricalpro-preview.pages.dev`) is separate and only changes when it's deployed by hand.

The steps below are for the earlier plan of hosting on xneelo, kept for reference. The domain and email are still with the client's current provider; the MX and `mail` DNS records must not be changed while the email lives there.

1. Run `npm run build`.
2. First launch only: back up the WordPress site (files and database) and keep the backup. Then delete WordPress's files from `public_html`, leaving anything that isn't WordPress, such as a `.well-known` folder.
3. Upload everything inside `dist/` to `public_html`, including `.htaccess`, but not the `.netlify` folder.
4. Check `http://` and `www.` addresses, an old WordPress address such as `/ep-solar/` or `/nikwaflora/`, a refresh on `/solar`, a made-up address (should show the 404 page), and a test enquiry through the form that arrives in the inbox.
