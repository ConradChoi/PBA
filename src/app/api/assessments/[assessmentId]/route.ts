import { NextResponse } from "next/server";
import { getAssessmentById } from "@/lib/assessments/get-assessment";

type RouteParams = { params: Promise<{ assessmentId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId);

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  return NextResponse.json(assessment);
}
