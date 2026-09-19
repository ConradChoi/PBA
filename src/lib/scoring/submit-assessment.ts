import type {
  ArchitectureLevel,
  BasicInfo,
  LayerAnswers,
  LayerId,
} from "../types/assessment";
import { findBottlenecks, findStrengths } from "./bottleneck";
import { classifyArchitectureLevel } from "./architecture-level";
import { scoreAllLayers, totalRawScore } from "./scoring";
import { PRIVACY_NOTICE_VERSION } from "../content/privacy-notice";

export type SubmitAssessmentInput = {
  basicInfo: BasicInfo;
  answers: LayerAnswers;
  privacyConsent: boolean;
  marketingConsent: boolean;
  utm?: { source?: string; medium?: string; campaign?: string };
};

export type AssessmentInsertRow = {
  name: string | null;
  email: string | null;
  company_name: string | null;
  role: string | null;
  business_stage: BasicInfo["businessStage"];
  business_stage_other: string | null;
  industry: string | null;
  team_size: string | null;
  score_value_raw: number;
  score_value_100: number;
  score_customer_raw: number;
  score_customer_100: number;
  score_offer_raw: number;
  score_offer_100: number;
  score_experience_raw: number;
  score_experience_100: number;
  score_process_raw: number;
  score_process_100: number;
  score_data_raw: number;
  score_data_100: number;
  score_scale_raw: number;
  score_scale_100: number;
  total_raw: number;
  architecture_level: ArchitectureLevel;
  bottleneck_1: LayerId;
  bottleneck_2: LayerId;
  bottleneck_3: LayerId;
  strength_1: LayerId;
  strength_2: LayerId;
  consulting_cta_clicked: boolean;
  consulting_requested: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  privacy_consent: boolean;
  privacy_consent_at: string | null;
  privacy_notice_version: string;
  marketing_consent: boolean;
};

export type AssessmentComputation = {
  row: AssessmentInsertRow;
  architectureLevel: ArchitectureLevel;
  totalRaw: number;
  bottlenecks: LayerId[];
  strengths: LayerId[];
};

export function computeAssessmentResult(
  input: SubmitAssessmentInput
): AssessmentComputation {
  const layerScores = scoreAllLayers(input.answers);
  const totalRaw = totalRawScore(layerScores);
  const architectureLevel = classifyArchitectureLevel(totalRaw);
  const bottlenecks = findBottlenecks(layerScores);
  const strengths = findStrengths(layerScores);

  const scoreByLayer = new Map(layerScores.map((l) => [l.layerId, l]));
  const get = (layerId: LayerId) => scoreByLayer.get(layerId)!;

  const row: AssessmentInsertRow = {
    name: input.basicInfo.name ?? null,
    email: input.basicInfo.email ?? null,
    company_name: input.basicInfo.companyName ?? null,
    role: input.basicInfo.role ?? null,
    business_stage: input.basicInfo.businessStage,
    business_stage_other: input.basicInfo.businessStageOther ?? null,
    industry: input.basicInfo.industry ?? null,
    team_size: input.basicInfo.teamSize ?? null,
    score_value_raw: get("value").raw,
    score_value_100: get("value").score100,
    score_customer_raw: get("customer").raw,
    score_customer_100: get("customer").score100,
    score_offer_raw: get("offer").raw,
    score_offer_100: get("offer").score100,
    score_experience_raw: get("experience").raw,
    score_experience_100: get("experience").score100,
    score_process_raw: get("process").raw,
    score_process_100: get("process").score100,
    score_data_raw: get("data").raw,
    score_data_100: get("data").score100,
    score_scale_raw: get("scale").raw,
    score_scale_100: get("scale").score100,
    total_raw: totalRaw,
    architecture_level: architectureLevel,
    bottleneck_1: bottlenecks[0],
    bottleneck_2: bottlenecks[1],
    bottleneck_3: bottlenecks[2],
    strength_1: strengths[0],
    strength_2: strengths[1],
    consulting_cta_clicked: false,
    consulting_requested: false,
    utm_source: input.utm?.source ?? null,
    utm_medium: input.utm?.medium ?? null,
    utm_campaign: input.utm?.campaign ?? null,
    privacy_consent: input.privacyConsent,
    privacy_consent_at: input.privacyConsent ? new Date().toISOString() : null,
    privacy_notice_version: PRIVACY_NOTICE_VERSION,
    marketing_consent: input.marketingConsent,
  };

  return { row, architectureLevel, totalRaw, bottlenecks, strengths };
}
