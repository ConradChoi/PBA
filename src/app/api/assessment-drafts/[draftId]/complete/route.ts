import { NextResponse } from "next/server";
import { isDraftComplete } from "@/lib/assessment-drafts/merge-answers";
import { persistAssessment } from "@/lib/scoring/persist-assessment";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { AssessmentDraftRow } from "@/lib/types/assessment";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";

type RouteParams = { params: Promise<{ draftId: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const { draftId } = await params;
  const supabase = createServiceRoleSupabaseClient();

  const { data: draft, error: fetchError } = await supabase
    .from("assessment_drafts")
    .select(
      "basic_info, answers, privacy_consent, marketing_consent, utm_source, utm_medium, utm_campaign, locale"
    )
    .eq("id", draftId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const row = draft as Pick<
    AssessmentDraftRow,
    | "basic_info"
    | "answers"
    | "privacy_consent"
    | "marketing_consent"
    | "utm_source"
    | "utm_medium"
    | "utm_campaign"
    | "locale"
  >;

  if (!isDraftComplete(row.answers)) {
    return NextResponse.json(
      { error: "All 7 layers must be answered before completing" },
      { status: 400 }
    );
  }

  const result = await persistAssessment({
    basicInfo: row.basic_info,
    answers: row.answers,
    privacyConsent: row.privacy_consent,
    marketingConsent: row.marketing_consent,
    utm: {
      source: row.utm_source ?? undefined,
      medium: row.utm_medium ?? undefined,
      campaign: row.utm_campaign ?? undefined,
    },
    // Copied from the draft, not re-resolved: the completion request may
    // arrive with different headers (e.g. the visitor's browser language
    // changed mid-flow), but the diagnosis was taken in whatever language
    // the draft was started in. The DB check constraint keeps this valid;
    // isLocale is just a type-safe belt-and-suspenders fallback.
    locale: isLocale(row.locale) ? row.locale : DEFAULT_LOCALE,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  await supabase.from("assessment_drafts").delete().eq("id", draftId);

  const { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths } = result;
  return NextResponse.json(
    { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths },
    { status: 201 }
  );
}
