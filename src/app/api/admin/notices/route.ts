import { NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { noticeSchema } from "@/lib/notices/notice.schema";
import { sanitizeNoticeHtml } from "@/lib/notices/sanitize-notice-html";
import { createNotice } from "@/lib/notices/get-notices";

export async function POST(request: Request) {
  const operator = await getCurrentOperator();

  if (!operator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = noticeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const id = await createNotice({
    title: parsed.data.title,
    // Sanitize before storing: every later render trusts what is in the row.
    bodyHtml: sanitizeNoticeHtml(parsed.data.bodyHtml),
    isPublished: parsed.data.isPublished,
    isImportant: parsed.data.isImportant,
    importantUntil: parsed.data.isImportant ? parsed.data.importantUntil : null,
    operatorEmail: operator.email,
  });

  return NextResponse.json({ id }, { status: 201 });
}
