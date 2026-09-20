import { NextResponse } from "next/server";
import { resultFitSchema } from "@/lib/assessments/outcome.schema";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ assessmentId: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { assessmentId } = await params;
  const body = await request.json();
  const parsed = resultFitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data: assessment, error: fetchError } = await supabase
    .from("assessments")
    .select("id")
    .eq("id", assessmentId)
    .maybeSingle();

  if (fetchError) {
    console.error("result fit: assessment lookup failed", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("assessments")
    .update({ result_fit: parsed.data.resultFit, result_fit_at: new Date().toISOString() })
    .eq("id", assessmentId);

  if (error) {
    console.error("result fit: update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
