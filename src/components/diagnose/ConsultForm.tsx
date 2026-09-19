"use client";

import Link from "next/link";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics/ga4";

export function ConsultForm({
  assessmentId,
  maskedEmail,
}: {
  assessmentId: string;
  maskedEmail: string;
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const response = await fetch(`/api/assessments/${assessmentId}/consulting-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message || undefined }),
    });

    if (!response.ok) {
      setError("신청을 접수하지 못했습니다. 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    trackEvent("radar_consulting_submit");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-base font-semibold text-slate-900">신청이 접수되었습니다</p>
          <p className="mt-2 text-sm text-slate-600">
            확인 후 {maskedEmail}(으)로 연락드리겠습니다.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full bg-slate-900 py-4 text-center text-sm font-semibold text-white"
        >
          처음으로
        </Link>
        <Link
          href={`/diagnose/result/${assessmentId}`}
          className="text-center text-sm font-semibold text-slate-600 underline"
        >
          진단 결과 다시 보기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-slate-700">연락받을 이메일</span>
        <p className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-slate-900">{maskedEmail}</p>
        <p className="text-xs text-slate-500">진단을 시작할 때 입력하신 이메일로 연락드립니다.</p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-slate-700">전달하고 싶은 말 (선택)</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="rounded-lg border border-slate-200 px-3.5 py-2.5"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-slate-900 py-4 text-sm font-semibold text-white disabled:opacity-40"
      >
        {submitting ? "접수하는 중..." : "상담 신청하기"}
      </button>
    </form>
  );
}
