import type { LayerId } from "../types/assessment";

export type LayerConfig = {
  id: LayerId;
  name: string;
  shortName: string;
};

export const LAYERS: LayerConfig[] = [
  { id: "value", name: "VALUE", shortName: "Value" },
  { id: "customer", name: "CUSTOMER", shortName: "Customer" },
  { id: "offer", name: "OFFER", shortName: "Offer" },
  { id: "experience", name: "EXPERIENCE", shortName: "Experience" },
  { id: "process", name: "PROCESS", shortName: "Process" },
  { id: "data", name: "DATA & INTELLIGENCE", shortName: "Data" },
  { id: "scale", name: "SCALE", shortName: "Scale" },
];
