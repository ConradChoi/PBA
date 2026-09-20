import { NextResponse } from "next/server";
import { outcomeSchema } from "@/lib/assessments/outcome.schema";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ assessmentId: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { assessmentId } = await params;
  const body = await request.json();
  const parsed = outcomeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data: assessment, error: fetchError } = await supabase
    .from("assessments")
    .select("id, outcome_at")
    .eq("id", assessmentId)
    .maybeSingle();

  if (fetchError) {
    console.error("outcome: assessment lookup failed", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }
  // Write-once: the result URL is the only credential, so anyone holding it
  // could otherwise keep rewriting someone else's answers.
  if (assessment.outcome_at) {
    return NextResponse.json({ error: "이미 제출되었습니다." }, { status: 409 });
  }

  const { error } = await supabase
    .from("assessments")
    .update({
      revenue_band: parsed.data.revenueBand,
      growth_band: parsed.data.growthBand,
      outcome_at: new Date().toISOString(),
    })
    .eq("id", assessmentId);

  if (error) {
    console.error("outcome: update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
