import type { BusinessStage } from "@/lib/types/assessment";

export const BUSINESS_STAGES: { value: BusinessStage; label: string }[] = [
  { value: "idea", label: "아이디어" },
  { value: "mvp_prep", label: "MVP 준비" },
  { value: "building", label: "구축 중" },
  { value: "operating", label: "운영 중" },
  { value: "growth", label: "성장" },
  { value: "realign", label: "재정비" },
  { value: "other", label: "기타" },
];

export function formatBusinessStage(
  stage: BusinessStage,
  other: string | null
): string {
  const label = BUSINESS_STAGES.find((s) => s.value === stage)?.label ?? stage;
  return stage === "other" && other ? `${label} (${other})` : label;
}
