import { ServicePageLayout } from "@/components/site/ServicePageLayout";
import img from "@/assets/service-agricultural.jpg";

const Agricultural = () => (
  <ServicePageLayout
    eyebrow="Agricultural"
    title="Electrical for farms & agri-businesses"
    intro="Specialist electrical services built for the realities of farm life — robust, weatherproof installations that keep dairies, irrigation and processing running."
    image={img}
    body={`Farms don't stop. We understand the cost of downtime in dairy parlours, pump stations and pack-houses, so we build installations that are tough, serviceable and properly protected against the elements.\n\nFrom three-phase motor controls to solar borehole pumping, we've done it across the Garden Route for over thirty years.`}
    offerings={[
      "Dairy parlour electrical installations",
      "Three-phase motor & pump controls",
      "Irrigation & borehole pump systems",
      "Solar pumping solutions",
      "Cold-room & pack-house electrics",
      "Standby generator integration",
      "Surge & lightning protection",
      "Cable Fault Location",
    ]}
  />
);

export default Agricultural;
