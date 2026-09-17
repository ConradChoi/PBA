export type BusinessStage =
  | "idea"
  | "mvp_prep"
  | "building"
  | "operating"
  | "growth"
  | "realign"
  | "other";

export type ArchitectureLevel =
  | "IDEA_STAGE"
  | "FOUNDER_DEPENDENT"
  | "STRUCTURE_NEEDED"
  | "GROWTH_READY"
  | "SYSTEMIZED";

export type LayerId =
  | "value"
  | "customer"
  | "offer"
  | "experience"
  | "process"
  | "data"
  | "scale";

export const LAYER_IDS: LayerId[] = [
  "value",
  "customer",
  "offer",
  "experience",
  "process",
  "data",
  "scale",
];

export type LayerAnswerSet = [number, number, number, number];

export type LayerAnswers = Record<LayerId, LayerAnswerSet>;

export type LayerScore = {
  layerId: LayerId;
  raw: number;
  score100: number;
};

export type BasicInfo = {
  name: string;
  email: string;
  companyName?: string;
  role?: string;
  businessStage: BusinessStage;
  businessStageOther?: string;
  industry?: string;
  teamSize?: string;
};

export type DraftAnswers = Partial<LayerAnswers>;

export type AssessmentDraftRow = {
  id: string;
  created_at: string;
  updated_at: string;
  basic_info: BasicInfo;
  answers: DraftAnswers;
  current_step: number;
  privacy_consent: boolean;
  marketing_consent: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};
