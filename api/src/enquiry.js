// What happens to an enquiry from the website's contact form (src/components/site/ContactSection.tsx):
// the spam checks, then the email to the office. Kept apart from the Azure Functions wiring
// (functions/contact.js) so the tests can run it directly.
//
// Settings, in the Azure portal under the Static Web App's Environment variables (never in the code):
//   RESEND_API_KEY        the key from resend.com that sends the email
//   TURNSTILE_SECRET_KEY  the secret key of the Cloudflare Turnstile widget on the form
//   CONTACT_TO            optional: where enquiries go (info@electricalpro.co.za if not set)
//   CONTACT_FROM          optional: who they're from. Until the domain is verified in Resend this has to
//                         be Resend's own test address (the default), and Resend only delivers to the
//                         address the Resend account was opened with, so set CONTACT_TO to that for
//                         testing. Once it's verified: "Electrical Pro website <website@electricalpro.co.za>"

export const SERVICES = ["EP Solar", "Commercial", "Agricultural", "Residential", "Other"];
const DEFAULT_TO = "info@electricalpro.co.za";
const DEFAULT_FROM = "Electrical Pro website <onboarding@resend.dev>";

// The page sends how long ago (in ms) the visitor first went into the form: anything sent sooner than
// this is a bot (people take longer to fill it in), and so is anything sent without it
export const MIN_FILL_MS = 3000;

// One line of text, trimmed and cut to length
const field = (form, key, maxLength) => {
  const value = form.get(key);
  return typeof value === "string" ? value.replace(/[\r\n]+/g, " ").slice(0, maxLength).trim() : "";
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cloudflare's answer on whether the form was sent by a person (the Turnstile widget's token)
const passedTurnstile = async (token, secret, ip, fetchImpl) => {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const result = await res.json();
    return result.success === true;
  } catch {
    return false;
  }
};

// Returns the HTTP status for the reply: 200 sent (or quietly dropped as spam), 400 turned away,
// 500 couldn't send. The page shows its "didn't send, please phone or email" message for anything but 200.
export async function handleEnquiry(form, { env, ip, fetchImpl = fetch, log = () => {} }) {
  // People never see this field, but spam bots fill in everything: act as if it worked and drop it
  if (field(form, "website", 200) !== "") return 200;

  // Sent too soon after the form was opened, or not through the page at all (see MIN_FILL_MS)
  const elapsed = Number(form.get("elapsed"));
  if (!Number.isInteger(elapsed) || elapsed < MIN_FILL_MS) return 400;

  const name = field(form, "name", 100);
  const phone = field(form, "phone", 40);
  const email = field(form, "email", 200);
  const chosen = form.get("service");
  const service = SERVICES.includes(chosen) ? chosen : "Other";
  const rawMessage = form.get("message");
  const message = typeof rawMessage === "string" ? rawMessage.slice(0, 5000).trim() : "";
  if (!name || !message || !EMAIL.test(email)) return 400;

  if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) {
    log("Contact form isn't set up: RESEND_API_KEY or TURNSTILE_SECRET_KEY is missing");
    return 500;
  }
  if (!(await passedTurnstile(form.get("cf-turnstile-response"), env.TURNSTILE_SECRET_KEY, ip, fetchImpl))) return 400;

  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.CONTACT_FROM || DEFAULT_FROM,
      to: [env.CONTACT_TO || DEFAULT_TO],
      // Hitting reply answers the customer
      reply_to: email,
      subject: `Website enquiry: ${service} - ${name}`,
      text: `Name: ${name}\nPhone: ${phone || "-"}\nEmail: ${email}\nService: ${service}\n\n${message}\n`,
    }),
  }).catch((error) => ({ ok: false, status: 0, text: async () => String(error) }));
  if (!res.ok) {
    log(`Resend didn't send the enquiry (${res.status}): ${await res.text().catch(() => "")}`);
    return 500;
  }
  return 200;
}
