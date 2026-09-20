"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./Modal";
import { ConfirmDialog } from "./ConfirmDialog";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { RETENTION_UNITS, type RetentionUnit } from "@/lib/assessments/retention";

export function RetentionCard({
  assessmentId,
  hasPersonalData,
  defaultPurgeAt,
  retainUntil,
  retentionReason,
  retentionUpdatedBy,
  retentionUpdatedAt,
}: {
  assessmentId: string;
  hasPersonalData: boolean;
  defaultPurgeAt: string;
  retainUntil: string | null;
  retentionReason: string | null;
  retentionUpdatedBy: string | null;
  retentionUpdatedAt: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState("6");
  const [unit, setUnit] = useState<RetentionUnit>("months");
  const [reason, setReason] = useState(retentionReason ?? "");
  const [confirmingPurge, setConfirmingPurge] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(body: unknown, path: "retention" | "purge") {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/admin/assessments/${assessmentId}/${path}`, {
      method: path === "retention" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: path === "retention" ? JSON.stringify(body) : undefined,
    });
    setBusy(false);

    if (!response.ok) {
      setError("처리하지 못했습니다. 다시 시도해주세요.");
      return;
    }

    setEditing(false);
    setConfirmingPurge(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-5 text-sm">
      <p className="font-semibold text-slate-900">정보 보관</p>

      {!hasPersonalData ? (
        <p className="text-slate-500">개인정보 없음 (익명 진단이거나 이미 파기됨)</p>
      ) : retainUntil ? (
        <div className="flex flex-col gap-1 text-slate-600">
          <p>
            연장 보관 ·{" "}
            <span className="font-medium text-slate-900">
              {new Date(retainUntil).toLocaleDateString("ko-KR")}까지 유지
            </span>
          </p>
          <p className="text-xs">사유: {retentionReason}</p>
          <p className="text-xs text-slate-400">
            설정 {retentionUpdatedBy} ·{" "}
            {retentionUpdatedAt ? new Date(retentionUpdatedAt).toLocaleString("ko-KR") : ""}
          </p>
        </div>
      ) : (
        <p className="text-slate-600">
          기본 정책 ·{" "}
          <span className="font-medium text-slate-900">
            {new Date(defaultPurgeAt).toLocaleDateString("ko-KR")}
          </span>{" "}
          개인정보 파기 예정
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {hasPersonalData && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700"
          >
            {retainUntil ? "보관 기간 수정" : "보관 기간 설정"}
          </button>
          {retainUntil && (
            <button
              type="button"
              onClick={() => send({ reset: true }, "retention")}
              disabled={busy}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
            >
              기본 정책으로 되돌리기
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmingPurge(true)}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-red-600"
          >
            개인정보 지금 삭제
          </button>
        </div>
      )}

      <Modal open={editing} onClose={() => setEditing(false)} title="보관 기간 설정" size="sm">
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-end gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">기간</span>
              <input
                type="number"
                min={1}
                max={120}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24 rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">단위</span>
              <ChipGroup
                name="retentionUnit"
                label="보관 기간 단위"
                options={[...RETENTION_UNITS]}
                value={unit}
                onChange={setUnit}
                size="sm"
              />
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600">사유 *</span>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 2026 하반기 컨설팅 계약 (재진단 예정)"
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <p className="text-xs text-slate-500">
            오늘부터 계산합니다. 계약 등으로 고객이 보관 사실을 알고 있어야 합니다.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              취소
            </button>
            <button
              type="button"
              disabled={busy || !reason.trim() || !amount}
              onClick={() =>
                send({ amount: Number(amount), unit, reason: reason.trim() }, "retention")
              }
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              저장
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmingPurge}
        title="개인정보 삭제"
        message="이름·이메일·회사명·역할·업종·유입 경로와 이 진단의 상담 신청을 즉시 삭제합니다. 진단 점수는 통계용으로 남습니다. 되돌릴 수 없습니다."
        confirmLabel="삭제"
        busy={busy}
        onConfirm={() => send(null, "purge")}
        onCancel={() => setConfirmingPurge(false)}
      />
    </div>
  );
}
