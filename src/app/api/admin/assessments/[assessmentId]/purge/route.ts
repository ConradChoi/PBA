import { NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ assessmentId: string }> };

// Same effect as the nightly purge, on demand: used when a customer asks for
// deletion or a contract ends early.
export async function POST(_request: Request, { params }: RouteParams) {
  const operator = await getCurrentOperator();

  if (!operator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { assessmentId } = await params;
  const supabase = createServiceRoleSupabaseClient();

  const { error: requestsError } = await supabase
    .from("consulting_requests")
    .delete()
    .eq("assessment_id", assessmentId);

  if (requestsError) {
    console.error("manual purge: deleting consulting requests failed", requestsError);
    return NextResponse.json({ error: requestsError.message }, { status: 500 });
  }

  const { error } = await supabase
    .from("assessments")
    .update({
      name: null,
      email: null,
      company_name: null,
      role: null,
      marketing_consent: false,
      industry: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      retain_until: null,
      retention_reason: null,
      retention_updated_by: operator.email,
      retention_updated_at: new Date().toISOString(),
    })
    .eq("id", assessmentId);

  if (error) {
    console.error("manual purge: update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
