import { ServicePageLayout } from "@/components/site/ServicePageLayout";
import img from "@/assets/service-commercial.jpg";

const Commercial = () => (
  <ServicePageLayout
    eyebrow="Commercial"
    title="Commercial electrical contracting"
    intro="Reliable, compliant electrical work for offices, retail, hospitality and industrial sites — delivered on time and to the highest safety standards."
    image={img}
    body={`We've wired everything from boutique cafés to large industrial fit-outs. Our team works efficiently around your operations and documents everything properly.\n\nWhether it's a new build, refurbishment, or ongoing maintenance contract, we bring the same disciplined approach.`}
    offerings={[
      "New commercial installations & fit-outs",
      "Distribution boards & main switchboards",
      "LED lighting design & retrofits",
      "Generator & UPS integration",
      "Electrical maintenance contracts",
      "Fault finding & emergency response",
      "Certificates of Compliance (COC)",
    ]}
  />
);

export default Commercial;
