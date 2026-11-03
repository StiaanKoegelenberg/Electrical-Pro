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

The form posts to `public/contact.php`, which emails each enquiry to the address in its `TO` constant. PHP only runs on the live hosting, so locally every send shows the "didn't send" message. Send a test enquiry after each upload and check that it arrives in that inbox: the form says thanks as soon as the mail server accepts the message, so a mistyped or missing mailbox would lose enquiries without any error.

## Deploying

The domain, website and email are all on the client's xneelo hosting. Their email lives there too, so the hosting package stays, and the MX and `mail` DNS records must not be changed.

1. Run `npm run build`.
2. First launch only: back up the WordPress site (files and database) and keep the backup. Then delete WordPress's files from `public_html`, leaving anything that isn't WordPress, such as a `.well-known` folder.
3. Upload everything inside `dist/` to `public_html`, including `.htaccess`, but not the `.netlify` folder.
4. Check `http://` and `www.` addresses, an old WordPress address such as `/ep-solar/` or `/nikwaflora/`, a refresh on `/solar`, a made-up address (should show the 404 page), and a test enquiry through the form that arrives in the inbox.
