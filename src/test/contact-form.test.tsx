import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactSection } from "@/components/site/ContactSection";
import { Toaster } from "@/components/ui/toaster";
import { smoothScrollTo } from "@/lib/scroll";

// jsdom can't scroll; the form only needs to ask for it
vi.mock("@/lib/scroll", () => ({ smoothScrollTo: vi.fn() }));

const renderForm = () =>
  render(
    <MemoryRouter>
      <ContactSection />
      <Toaster />
    </MemoryRouter>,
  );

const fillInAndSend = () => {
  renderForm();
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
    // Its height: "auto" animations (the field messages) also put the scroll position back with
    // window.scrollTo, which jsdom doesn't have either
    vi.stubGlobal("scrollTo", vi.fn());
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

  it("sends how long the form was open, from the first field the visitor went into", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    // The clock jumps 42 seconds while the visitor fills the form in. It keeps running rather than being
    // frozen, which stalls the toast.
    const realNow = Date.now.bind(Date);
    let jump = 0;
    const now = vi.spyOn(Date, "now").mockImplementation(() => realNow() + jump);
    try {
      renderForm();
      screen.getByLabelText("Name").focus();
      jump = 42_000;
      fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Jan Smit" } });
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jan@example.com" } });
      fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Borehole pump quote, please" } });
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));

      // Not waiting on the thanks toast: the previous test's toast is still in the shared toast list
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      const elapsed = Number((fetchMock.mock.calls[0][1].body as FormData).get("elapsed"));
      expect(elapsed).toBeGreaterThanOrEqual(42_000);
      expect(elapsed).toBeLessThan(43_000);
    } finally {
      now.mockRestore();
    }
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

  it("asks for missing details in its own messages instead of sending", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText("Please enter your name")).toBeInTheDocument();
    expect(screen.getByText("Please enter your email address")).toBeInTheDocument();
    expect(screen.getByText("Please enter your message")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    const name = screen.getByLabelText("Name");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Please enter your name");
    expect(name).toHaveFocus();
    expect(smoothScrollTo).toHaveBeenCalledWith(name);

    // Fixing a field clears its message; an email address that isn't one gets a message of its own
    fireEvent.change(name, { target: { value: "Jan Smit" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jan@" } });
    expect(name).toHaveAttribute("aria-invalid", "false");
    expect(
      await screen.findByText("Please enter a valid email address, for example name@company.co.za"),
    ).toBeInTheDocument();
  });
});
