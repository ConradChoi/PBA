import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { persistAssessment } from "@/lib/scoring/persist-assessment";
import { submitAssessmentSchema } from "@/lib/scoring/submit-assessment.schema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = submitAssessmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Same as the draft path: recorded from the request, not accepted as
  // payload, so tools/tests submitting directly can't spoof it.
  const locale = await getLocale();
  const result = await persistAssessment({ ...parsed.data, locale });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths } = result;
  return NextResponse.json(
    { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths },
    { status: 201 }
  );
}
