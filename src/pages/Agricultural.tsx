import { ServicePageLayout } from "@/components/site/ServicePageLayout";
import img from "@/assets/service-agricultural.jpg";

const Agricultural = () => (
  <ServicePageLayout
    eyebrow="Agricultural"
    title="Electrical for farms & agri-businesses"
    intro="Specialist electrical services built for the realities of farm life — robust, weatherproof installations that keep dairies, irrigation and processing running."
    image={img}
    body={`Farms don't stop. We understand the cost of downtime in dairy parlours, pump stations and pack-houses, so we build installations that are tough and serviceable.`}
    offerings={[
      "Dairy parlour electrical installations",
      "Motors/gearboxes & Pump controls",
      "Irrigation & borehole pump systems",
      "Solar pumping solutions",
      "Cold-room & pack-house electrics",
      "Standby generator integration",
      "Surge & lightning protection",
      "Cable Fault Location",
      "Variable Speed Drives (VSDs)",
      "Device Remote Control",
      "Power Analysis and Power Factor Correction",
    ]}
    rentals={[
      "Ditch Witch for trenching",
      "Cherry Pickers",
    ]}
  />
);

export default Agricultural;
