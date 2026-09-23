import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { draftBasicInfoSchema } from "@/lib/scoring/submit-assessment.schema";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = draftBasicInfoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { basicInfo, privacyConsent, marketingConsent, utm } = parsed.data;
  // Recorded once, here, so operators answer consult requests in the
  // language the diagnosis was actually taken in -- see submit-assessment.ts.
  const locale = await getLocale();

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessment_drafts")
    .insert({
      basic_info: basicInfo,
      answers: {},
      current_step: 0,
      privacy_consent: privacyConsent,
      marketing_consent: marketingConsent,
      utm_source: utm?.source ?? null,
      utm_medium: utm?.medium ?? null,
      utm_campaign: utm?.campaign ?? null,
      locale,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ draftId: data.id }, { status: 201 });
}
