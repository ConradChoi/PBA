import { NextResponse } from "next/server";
import { submitConsultingRequestSchema } from "@/lib/consulting/submit-consulting-request.schema";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { PRIVACY_NOTICE_VERSION } from "@/lib/content/privacy-notice";

type RouteParams = { params: Promise<{ assessmentId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { assessmentId } = await params;
  const body = await request.json();
  const parsed = submitConsultingRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();

  const { data: assessment, error: fetchError } = await supabase
    .from("assessments")
    .select("id, email")
    .eq("id", assessmentId)
    .maybeSingle();

  if (fetchError) {
    console.error("consulting request: assessment lookup failed", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const { contact } = parsed.data;

  // An anonymous diagnosis has no email to answer at. Save the contact (and
  // the consent that comes with it) first, so a request never exists without
  // a way to reach the person.
  if (!assessment.email) {
    if (!contact) {
      return NextResponse.json(
        { error: "Contact details are required for an anonymous diagnosis" },
        { status: 400 }
      );
    }

    const { error: contactError } = await supabase
      .from("assessments")
      .update({
        name: contact.name,
        email: contact.email,
        privacy_consent: true,
        privacy_consent_at: new Date().toISOString(),
        privacy_notice_version: PRIVACY_NOTICE_VERSION,
      })
      .eq("id", assessmentId);

    if (contactError) {
      console.error("consulting request: saving contact failed", contactError);
      return NextResponse.json({ error: contactError.message }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from("consulting_requests")
    .insert({
      assessment_id: assessmentId,
      message: parsed.data.message ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("consulting request: insert failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("assessments").update({ consulting_requested: true }).eq("id", assessmentId);

  return NextResponse.json({ requestId: data.id }, { status: 201 });
}
