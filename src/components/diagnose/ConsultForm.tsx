"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics/ga4";

export function ConsultForm({ assessmentId }: { assessmentId: string }) {
  const [preferredContact, setPreferredContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!preferredContact.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    const response = await fetch(`/api/assessments/${assessmentId}/consulting-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        preferredContact,
        message: message || undefined,
      }),
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
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-base font-semibold text-slate-900">신청이 접수되었습니다</p>
        <p className="mt-2 text-sm text-slate-600">
          확인 후 남겨주신 연락처로 연락드리겠습니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-slate-700">선호 연락처 *</span>
        <input
          value={preferredContact}
          onChange={(e) => setPreferredContact(e.target.value)}
          placeholder="010-1234-5678 또는 이메일로 연락 주세요"
          className="rounded-lg border border-slate-200 px-3.5 py-2.5"
        />
      </label>

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
        disabled={!preferredContact.trim() || submitting}
        className="rounded-full bg-slate-900 py-4 text-sm font-semibold text-white disabled:opacity-40"
      >
        {submitting ? "접수하는 중..." : "상담 신청하기"}
      </button>
    </form>
  );
}
