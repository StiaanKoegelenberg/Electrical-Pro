import { ServicePageLayout } from "@/components/site/ServicePageLayout";
import img from "@/assets/service-residential.jpg";

const Residential = () => (
  <ServicePageLayout
    eyebrow="Residential"
    title="Wiring your home for the future"
    intro="Safe, neat, certified residential electrical work — from small repairs to full home rewires, smart home installs and home solar."
    image={img}
    body={`Your home should be safe, comfortable and ready for whatever you plug into it. We help homeowners modernise older wiring, plan additions properly, and add smart features without the chaos.\n\nEverything we do is fully compliant for your peace of mind.`}
    offerings={[
      "New home wiring & extensions",
      "Rewires & DB board upgrades",
      "Lighting design & dimming",
      "Smart home & home automation",
      "Pool, geyser & garage electrics",
      "Home solar & backup power",
      "Electrical Certificates of Compliance",
    ]}
  />
);

export default Residential;
