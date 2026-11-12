import { describe, expect, it, vi } from "vitest";
// The Azure function's logic (api/src/enquiry.js), which emails the contact form's enquiries
import { handleEnquiry } from "../../api/src/enquiry.js";

const env = { RESEND_API_KEY: "re_test", TURNSTILE_SECRET_KEY: "turnstile-secret" };

const enquiry = (changes: Record<string, string | null> = {}) => {
  const form = new FormData();
  const fields: Record<string, string | null> = {
    name: "Jan Smit",
    phone: "082 123 4567",
    email: "jan@example.com",
    service: "Agricultural",
    message: "Borehole pump quote, please",
    elapsed: "15000",
    website: "",
    "cf-turnstile-response": "turnstile-pass",
    ...changes,
  };
  for (const [k, v] of Object.entries(fields)) if (v !== null) form.set(k, v);
  return form;
};

// Cloudflare and Resend, answering as told
const services = ({ human = true, sent = true } = {}) =>
  vi.fn(async (url: string, _init?: RequestInit) =>
    url.includes("turnstile")
      ? new Response(JSON.stringify({ success: human }))
      : new Response(JSON.stringify(sent ? { id: "email-1" } : { message: "nope" }), { status: sent ? 200 : 422 }),
  );

describe("contact form function", () => {
  it("checks Turnstile, then emails the enquiry to the office with the customer as reply-to", async () => {
    const fetchImpl = services();
    expect(await handleEnquiry(enquiry(), { env, ip: "203.0.113.9", fetchImpl })).toBe(200);

    const [turnstileUrl, turnstileInit] = fetchImpl.mock.calls[0];
    expect(turnstileUrl).toContain("challenges.cloudflare.com/turnstile/v0/siteverify");
    const check = turnstileInit.body as URLSearchParams;
    expect(check.get("secret")).toBe("turnstile-secret");
    expect(check.get("response")).toBe("turnstile-pass");
    expect(check.get("remoteip")).toBe("203.0.113.9");

    const [resendUrl, resendInit] = fetchImpl.mock.calls[1];
    expect(resendUrl).toBe("https://api.resend.com/emails");
    expect((resendInit.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    const email = JSON.parse(resendInit.body as string);
    expect(email.to).toEqual(["info@electricalpro.co.za"]);
    expect(email.reply_to).toBe("jan@example.com");
    expect(email.subject).toBe("Website enquiry: Agricultural - Jan Smit");
    expect(email.text).toContain("Phone: 082 123 4567");
    expect(email.text).toContain("Borehole pump quote, please");
  });

  it("sends to and from the addresses in the settings, if set", async () => {
    const fetchImpl = services();
    await handleEnquiry(enquiry(), {
      env: { ...env, CONTACT_TO: "test@example.com", CONTACT_FROM: "Site <website@electricalpro.co.za>" },
      fetchImpl,
    });
    const email = JSON.parse(fetchImpl.mock.calls[1][1].body as string);
    expect(email.to).toEqual(["test@example.com"]);
    expect(email.from).toBe("Site <website@electricalpro.co.za>");
  });

  it("quietly drops anything with the hidden field filled in, without emailing", async () => {
    const fetchImpl = services();
    expect(await handleEnquiry(enquiry({ website: "http://spam.example" }), { env, fetchImpl })).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("turns away enquiries sent too fast, not through the page, or missing details", async () => {
    const fetchImpl = services();
    for (const changes of [{ elapsed: "900" }, { elapsed: null }, { name: "  " }, { email: "jan@" }, { message: null }]) {
      expect(await handleEnquiry(enquiry(changes), { env, fetchImpl })).toBe(400);
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("turns away enquiries that fail the Turnstile check, or come without its pass", async () => {
    const fetchImpl = services({ human: false });
    expect(await handleEnquiry(enquiry(), { env, fetchImpl })).toBe(400);
    expect(await handleEnquiry(enquiry({ "cf-turnstile-response": null }), { env, fetchImpl: services() })).toBe(400);
    // Only the one Turnstile check, and no email
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("reports a failure (so the page shows the phone number) when it isn't set up or Resend refuses", async () => {
    const log = vi.fn();
    expect(await handleEnquiry(enquiry(), { env: {}, fetchImpl: services(), log })).toBe(500);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("isn't set up"));
    expect(await handleEnquiry(enquiry(), { env, fetchImpl: services({ sent: false }), log })).toBe(500);
    expect(log).toHaveBeenLastCalledWith(expect.stringContaining("422"));
  });

  it("files an unknown service under Other and keeps each field to one line", async () => {
    const fetchImpl = services();
    await handleEnquiry(enquiry({ service: "Hacking", name: "Jan\r\nBcc: x@example.com" }), { env, fetchImpl });
    const email = JSON.parse(fetchImpl.mock.calls[1][1].body as string);
    expect(email.subject).toBe("Website enquiry: Other - Jan Bcc: x@example.com");
  });
});
