import { NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { noticeSchema } from "@/lib/notices/notice.schema";
import { sanitizeNoticeHtml } from "@/lib/notices/sanitize-notice-html";
import { deleteNotice, updateNotice } from "@/lib/notices/get-notices";

type RouteParams = { params: Promise<{ noticeId: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  const operator = await getCurrentOperator();

  if (!operator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { noticeId } = await params;
  const body = await request.json();
  const parsed = noticeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await updateNotice(noticeId, {
    title: parsed.data.title,
    bodyHtml: sanitizeNoticeHtml(parsed.data.bodyHtml),
    isPublished: parsed.data.isPublished,
    isImportant: parsed.data.isImportant,
    importantUntil: parsed.data.isImportant ? parsed.data.importantUntil : null,
    operatorEmail: operator.email,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const operator = await getCurrentOperator();

  if (!operator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { noticeId } = await params;
  await deleteNotice(noticeId);

  return NextResponse.json({ ok: true });
}
