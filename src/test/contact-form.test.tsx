import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactSection } from "@/components/site/ContactSection";
import { Toaster } from "@/components/ui/toaster";

const fillInAndSend = () => {
  render(
    <>
      <ContactSection />
      <Toaster />
    </>,
  );
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Jan Smit" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jan@example.com" } });
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Borehole pump quote, please" } });
  fireEvent.click(screen.getByRole("button", { name: /send message/i }));
};

describe("contact form", () => {
  beforeEach(() => {
    // framer-motion's whileInView needs IntersectionObserver, which jsdom doesn't have
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("posts the enquiry and only thanks the visitor once the server accepts it", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);

    fillInAndSend();

    expect(await screen.findByText("Thanks — we'll be in touch!")).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    const sent = init.body as FormData;
    expect(url).toBe("/contact.php");
    expect(sent.get("name")).toBe("Jan Smit");
    expect(sent.get("email")).toBe("jan@example.com");
    expect(sent.get("service")).toBe("EP Solar");
    expect(sent.get("message")).toBe("Borehole pump quote, please");
  });

  it("points the visitor to the phone and email when the enquiry doesn't go through", async () => {
    const notJson = async () => {
      throw new SyntaxError("Unexpected token <");
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404, json: notJson }));

    fillInAndSend();

    expect(await screen.findByText("Your message didn't send")).toBeInTheDocument();
    expect(screen.getByText(/Please call us on/)).toBeInTheDocument();
    expect(screen.queryByText("Thanks — we'll be in touch!")).not.toBeInTheDocument();
  });
});
