// The contact form posts here: /api/contact on the website (see ../enquiry.js for what it does)
import { app } from "@azure/functions";
import { handleEnquiry } from "../enquiry.js";

// The site on xneelo (built with `npm run build:xneelo`) is on another address than this function, so the
// browser only lets it read the answer if the answer names that address. Browsers send it without a slash;
// a trailing one is accepted too. Other addresses can be added, comma-separated, in the CONTACT_ORIGINS setting.
const ORIGINS = (process.env.CONTACT_ORIGINS || "https://electricalpro.co.za")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

function cors(request) {
  const origin = (request.headers.get("origin") || "").replace(/\/+$/, "");
  if (!ORIGINS.includes(origin)) return { Vary: "Origin" };
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

app.http("contact", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    const headers = cors(request);
    // The browser's check before a cross-origin send
    if (request.method === "OPTIONS") return { status: 204, headers };
    let form;
    try {
      form = await request.formData();
    } catch {
      return { status: 400, headers, jsonBody: { ok: false } };
    }
    // The visitor's own address, which Azure puts first in this header (an IPv4 one can carry a port)
    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim().replace(/^([\d.]+):\d+$/, "$1");
    const status = await handleEnquiry(form, { env: process.env, ip, log: (m) => context.error(m) });
    return { status, headers, jsonBody: { ok: status === 200 } };
  },
});
