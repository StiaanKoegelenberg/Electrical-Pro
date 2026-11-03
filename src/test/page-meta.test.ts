import { describe, expect, it } from "vitest";
import { PAGE_META, withPageHead } from "@/lib/page-meta";
// The real index.html, so the test also catches a head tag going missing from it
import indexHtml from "../../index.html?raw";
const image = "https://electricalpro.co.za/assets/service-agricultural-abc123.jpg";

describe("page heads", () => {
  it("gives a page its own title, description, address and preview image", () => {
    const html = withPageHead(indexHtml, "/agricultural", PAGE_META["/agricultural"], image);

    expect(html).toContain("<title>Electrical for farms &amp; agri-businesses | Electrical Pro</title>");
    expect(html).toContain('<meta name="description" content="Specialist electrical services built for the realities');
    expect(html).toContain('<link rel="canonical" href="https://electricalpro.co.za/agricultural"');
    expect(html).toContain('<meta property="og:url" content="https://electricalpro.co.za/agricultural"');
    expect(html).toContain('<meta property="og:title" content="Electrical for farms &amp; agri-businesses | Electrical Pro"');
    expect(html).toContain(`<meta property="og:image" content="${image}"`);
    expect(html).toContain(`<meta name="twitter:image" content="${image}"`);
    expect(html).not.toContain('content=""');
  });

  it("stops the build if index.html loses one of the tags", () => {
    const withoutCanonical = indexHtml.replace(/<link rel="canonical"[^>]*>/, "");
    expect(() => withPageHead(withoutCanonical, "/solar", PAGE_META["/solar"], image)).toThrow(/canonical/);
  });
});
