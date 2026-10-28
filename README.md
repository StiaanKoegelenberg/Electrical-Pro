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
- Phone and email: `src/lib/contact.ts`. Hours and location are written out in `ContactSection.tsx` and `Footer.tsx`.
- Testimonials: the list at the top of `src/components/site/Testimonials.tsx`. The section stays hidden until it has real quotes.
- Adding a page means adding its route in `src/App.tsx`, `public/.htaccess` and `public/sitemap.xml`.

## Contact form

The form posts to `public/contact.php`, which emails each enquiry to the address in its `TO` constant. PHP only runs on the live hosting, so locally every send shows the "didn't send" message. Send a test enquiry after each upload.

## Deploying

The domain, website and email are all on the client's xneelo hosting. Their email lives there too, so the hosting package stays, and the MX and `mail` DNS records must not be changed.

1. Run `npm run build`.
2. First launch only: back up the WordPress site (files and database), then clear it out of `public_html`.
3. Upload everything inside `dist/` to `public_html`, including `.htaccess`.
4. Check `http://` and `www.` addresses, an old WordPress address such as `/ep-solar/`, a refresh on `/solar`, a made-up address (should show the 404 page), and a test enquiry through the form.
