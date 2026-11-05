import { ServicePageLayout } from "@/components/site/ServicePageLayout";
import img from "@/assets/service-agricultural.jpg";

const Agricultural = () => (
  <ServicePageLayout
    title="Electrical for farms & agri-businesses"
    intro="Specialist electrical services built for the realities of farm life — robust, weatherproof installations that keep dairies, irrigation and processing running."
    image={img}
    body={`Farms don't stop. We understand the cost of downtime in dairy parlours, pump stations and pack-houses, so we build installations that are tough and serviceable.`}
    offerings={[
      "Dairy parlour electrical installations",
      "Motors/gearboxes & pump controls",
      "Irrigation & borehole pump systems",
      "Solar pumping solutions",
      "Cold-room & pack-house electrics",
      "Standby generator integration",
      "Surge & lightning protection",
      "Cable fault location",
      "Variable speed drives (VSDs)",
      "Device remote control",
      "Power analysis & power factor correction",
    ]}
    rentals={[
      "Ditch Witch for trenching",
      "Cherry pickers",
    ]}
  />
);

export default Agricultural;
