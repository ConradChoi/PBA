import { createServiceRoleSupabaseClient } from "../supabase/server";
import type { AssessmentInsertRow } from "../scoring/submit-assessment";

export type AssessmentRow = AssessmentInsertRow & {
  id: string;
  created_at: string;
};

export async function getAssessmentById(
  id: string
): Promise<AssessmentRow | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as AssessmentRow | null;
}
