"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NoticeEditor } from "./NoticeEditor";
import { ConfirmDialog } from "./ConfirmDialog";
import type { NoticeRow } from "@/lib/notices/types";

export function NoticeForm({ notice }: { notice?: NoticeRow }) {
  const router = useRouter();
  const [title, setTitle] = useState(notice?.title ?? "");
  const [bodyHtml, setBodyHtml] = useState(notice?.body_html ?? "");
  const [isPublished, setIsPublished] = useState(notice?.is_published ?? false);
  const [isImportant, setIsImportant] = useState(notice?.is_important ?? false);
  const [importantUntil, setImportantUntil] = useState(notice?.important_until ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSave() {
    setError(null);

    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!bodyHtml.trim() || bodyHtml === "<p></p>") {
      setError("내용을 입력해주세요.");
      return;
    }
    if (isImportant && !importantUntil) {
      setError("중요 공지는 표시 종료일을 정해주세요.");
      return;
    }

    setSaving(true);
    const response = await fetch(
      notice ? `/api/admin/notices/${notice.id}` : "/api/admin/notices",
      {
        method: notice ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          bodyHtml,
          isPublished,
          isImportant,
          importantUntil: isImportant ? importantUntil : null,
        }),
      }
    );
    setSaving(false);

    if (!response.ok) {
      setError("저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    router.push("/admin/notices");
    router.refresh();
  }

  async function handleDelete() {
    if (!notice) return;

    setDeleting(true);
    const response = await fetch(`/api/admin/notices/${notice.id}`, { method: "DELETE" });
    setDeleting(false);
    setConfirmingDelete(false);

    if (!response.ok) {
      setError("삭제하지 못했습니다.");
      return;
    }

    router.push("/admin/notices");
    router.refresh();
  }

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-slate-700">제목 *</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-slate-200 px-3.5 py-2.5"
        />
      </label>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-slate-700">내용 *</span>
        <NoticeEditor initialHtml={notice?.body_html ?? ""} onChange={setBodyHtml} />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 text-sm">
        <label className="flex items-center gap-2 font-medium text-slate-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          게시하기 (끄면 사용자에게 보이지 않습니다)
        </label>
        <label className="flex items-center gap-2 font-medium text-slate-700">
          <input
            type="checkbox"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
          />
          중요 공지 (모든 사용자 화면 상단에 띠로 표시)
        </label>
        {isImportant && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600">상단 표시 종료일 *</span>
            <input
              type="date"
              value={importantUntil}
              onChange={(e) => setImportantUntil(e.target.value)}
              className="w-48 rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {saving ? "저장하는 중..." : "저장"}
        </button>
        {notice && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-red-600"
          >
            삭제
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="공지 삭제"
        message={
          <>
            <span className="font-semibold text-slate-900">{notice?.title}</span> 공지를 삭제할까요?
            사용자 화면에서도 즉시 사라집니다.
          </>
        }
        confirmLabel="삭제"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
