// The contact form posts here: /api/contact on the website (see ../enquiry.js for what it does)
import { app } from "@azure/functions";
import { handleEnquiry } from "../enquiry.js";

app.http("contact", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    let form;
    try {
      form = await request.formData();
    } catch {
      return { status: 400, jsonBody: { ok: false } };
    }
    // The visitor's own address, which Azure puts first in this header (an IPv4 one can carry a port)
    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim().replace(/^([\d.]+):\d+$/, "$1");
    const status = await handleEnquiry(form, { env: process.env, ip, log: (m) => context.error(m) });
    return { status, jsonBody: { ok: status === 200 } };
  },
});
