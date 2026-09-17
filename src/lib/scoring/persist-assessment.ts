import { computeAssessmentResult } from "./submit-assessment";
import type { SubmitAssessmentInput } from "./submit-assessment";
import type { ArchitectureLevel, LayerId } from "../types/assessment";
import { createServiceRoleSupabaseClient } from "../supabase/server";

export type PersistAssessmentResult =
  | {
      ok: true;
      assessmentId: string;
      architectureLevel: ArchitectureLevel;
      totalRaw: number;
      bottlenecks: LayerId[];
      strengths: LayerId[];
    }
  | { ok: false; error: string };

export async function persistAssessment(
  input: SubmitAssessmentInput
): Promise<PersistAssessmentResult> {
  const { row, architectureLevel, totalRaw, bottlenecks, strengths } =
    computeAssessmentResult(input);

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessments")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, assessmentId: data.id, architectureLevel, totalRaw, bottlenecks, strengths };
}
