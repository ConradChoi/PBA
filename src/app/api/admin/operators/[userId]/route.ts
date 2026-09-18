import { NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { listOperators } from "@/lib/operators/list-operators";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ userId: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const operator = await getCurrentOperator();

  if (!operator || operator.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;

  if (userId === operator.id) {
    return NextResponse.json({ error: "본인 계정은 삭제할 수 없습니다." }, { status: 400 });
  }

  const operators = await listOperators();
  const target = operators.find((o) => o.id === userId);
  const ownerCount = operators.filter((o) => o.role === "owner").length;

  if (target?.role === "owner" && ownerCount <= 1) {
    return NextResponse.json(
      { error: "마지막 owner 계정은 삭제할 수 없습니다." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
