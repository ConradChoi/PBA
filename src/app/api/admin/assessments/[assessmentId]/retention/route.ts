import { NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { retentionSchema, retentionUntil } from "@/lib/assessments/retention";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ assessmentId: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  const operator = await getCurrentOperator();

  if (!operator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { assessmentId } = await params;
  const body = await request.json();
  const parsed = retentionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date().toISOString();
  const patch =
    "reset" in parsed.data
      ? {
          retain_until: null,
          retention_reason: null,
          retention_updated_by: operator.email,
          retention_updated_at: now,
        }
      : {
          retain_until: retentionUntil(parsed.data.amount, parsed.data.unit),
          retention_reason: parsed.data.reason,
          retention_updated_by: operator.email,
          retention_updated_at: now,
        };

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("assessments").update(patch).eq("id", assessmentId);

  if (error) {
    console.error("retention: update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ retainUntil: patch.retain_until });
}
