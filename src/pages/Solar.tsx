import { ServicePageLayout } from "@/components/site/ServicePageLayout";
import img from "@/assets/service-solar.jpg";

const Solar = () => (
  <ServicePageLayout
    eyebrow="EP Solar"
    title="Solar power, built for the Garden Route"
    intro="From single-home rooftops to large commercial arrays, we design and install solar systems that lower bills, reduce reliance on the grid and keep working through load-shedding."
    image={img}
    body={`We design every system around your actual energy use — not a spreadsheet template. That means correctly sized panels, the right inverter, and a battery setup that delivers backup when you actually need it.\n\nWe install Tier-1 panels and proven hybrid inverters, register systems where required, and back our workmanship.`}
    offerings={[
      "Grid-tied solar PV systems",
      "Hybrid solar with battery backup",
      "Off-grid solar solutions",
      "Load-shedding backup & UPS systems",
      "System monitoring & remote diagnostics",
      "Maintenance, cleaning & expansions",
      "Free site assessments & ROI projections",
    ]}
  />
);

export default Solar;
