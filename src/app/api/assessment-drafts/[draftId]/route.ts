import { NextResponse } from "next/server";
import { patchDraftAnswersSchema } from "@/lib/scoring/submit-assessment.schema";
import {
  countCompletedLayers,
  mergeLayerAnswers,
} from "@/lib/assessment-drafts/merge-answers";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { AssessmentDraftRow, DraftAnswers } from "@/lib/types/assessment";

type RouteParams = { params: Promise<{ draftId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { draftId } = await params;
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessment_drafts")
    .select("basic_info, answers, current_step")
    .eq("id", draftId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json({
    basicInfo: data.basic_info,
    answers: data.answers,
    currentStep: data.current_step,
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { draftId } = await params;
  const body = await request.json();
  const parsed = patchDraftAnswersSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data: draft, error: fetchError } = await supabase
    .from("assessment_drafts")
    .select("answers")
    .eq("id", draftId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const existingAnswers = (draft as Pick<AssessmentDraftRow, "answers">).answers as DraftAnswers;
  const { layerId, answers } = parsed.data;
  const mergedAnswers = mergeLayerAnswers(existingAnswers, layerId, answers);
  const currentStep = countCompletedLayers(mergedAnswers);

  const { data: updated, error: updateError } = await supabase
    .from("assessment_drafts")
    .update({
      answers: mergedAnswers,
      current_step: currentStep,
      updated_at: new Date().toISOString(),
    })
    .eq("id", draftId)
    .select("current_step")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ currentStep: updated.current_step });
}
