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
