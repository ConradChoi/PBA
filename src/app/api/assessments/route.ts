import { NextResponse } from "next/server";
import { computeAssessmentResult } from "@/lib/scoring/submit-assessment";
import { submitAssessmentSchema } from "@/lib/scoring/submit-assessment.schema";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = submitAssessmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { row, architectureLevel, totalRaw, bottlenecks, strengths } =
    computeAssessmentResult(parsed.data);

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessments")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { assessmentId: data.id, architectureLevel, totalRaw, bottlenecks, strengths },
    { status: 201 }
  );
}
