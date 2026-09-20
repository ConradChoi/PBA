import { createServiceRoleSupabaseClient } from "../supabase/server";
import type { AssessmentInsertRow } from "../scoring/submit-assessment";

export type AssessmentRow = AssessmentInsertRow & {
  id: string;
  created_at: string;
  result_fit: number | null;
  result_fit_at: string | null;
  revenue_band: string | null;
  growth_band: string | null;
  outcome_at: string | null;
  retain_until: string | null;
  retention_reason: string | null;
  retention_updated_by: string | null;
  retention_updated_at: string | null;
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

export async function listAssessments(): Promise<AssessmentRow[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AssessmentRow[];
}

export async function getAssessmentsByIds(ids: string[]): Promise<AssessmentRow[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase.from("assessments").select("*").in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AssessmentRow[];
}
