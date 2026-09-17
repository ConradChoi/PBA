import { NextResponse } from "next/server";
import { persistAssessment } from "@/lib/scoring/persist-assessment";
import { submitAssessmentSchema } from "@/lib/scoring/submit-assessment.schema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = submitAssessmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await persistAssessment(parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths } = result;
  return NextResponse.json(
    { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths },
    { status: 201 }
  );
}
