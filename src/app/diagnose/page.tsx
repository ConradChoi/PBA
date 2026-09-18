"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics/ga4";
import { PRIVACY_NOTICE } from "@/lib/content/privacy-notice";
import { BUSINESS_STAGES } from "@/lib/content/business-stage";
import type { BusinessStage } from "@/lib/types/assessment";

export default function DiagnosePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [businessStage, setBusinessStage] = useState<BusinessStage | "">("");
  const [businessStageOther, setBusinessStageOther] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    name &&
    email &&
    businessStage &&
    (businessStage !== "other" || businessStageOther.trim()) &&
    privacyConsent &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/assessment-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        basicInfo: {
          name,
          email,
          companyName: companyName || undefined,
          role: role || undefined,
          businessStage,
          businessStageOther:
            businessStage === "other" ? businessStageOther : undefined,
          industry: industry || undefined,
          teamSize: teamSize || undefined,
        },
        privacyConsent,
        marketingConsent,
      }),
    });

    if (!response.ok) {
      setError("진단을 시작하지 못했습니다. 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    const { draftId } = await response.json();
    trackEvent("radar_start");
    router.push(`/diagnose/${draftId}`);
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          PBA 7-Layer Business Radar
        </p>
        <h1 className="text-2xl font-bold">기본 정보를 알려주세요</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">이름 *</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">이메일 *</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">회사/브랜드명 (선택)</span>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">역할 (선택)</span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">사업 단계 *</span>
          <select
            value={businessStage}
            onChange={(e) => setBusinessStage(e.target.value as BusinessStage)}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          >
            <option value="">선택해주세요</option>
            {BUSINESS_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {businessStage === "other" && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">사업 단계 직접 입력 *</span>
            <input
              value={businessStageOther}
              onChange={(e) => setBusinessStageOther(e.target.value)}
              placeholder="현재 사업 단계를 입력해주세요"
              className="rounded-lg border border-slate-200 px-3.5 py-2.5"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">업종 (선택)</span>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">팀 규모 (선택)</span>
          <input
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
            />
            개인정보 수집·이용에 동의합니다 *
          </label>
          <p className="text-xs text-slate-500">{PRIVACY_NOTICE.summary}</p>
          <button
            type="button"
            onClick={() => setNoticeOpen((v) => !v)}
            className="w-fit text-xs font-semibold text-indigo-600"
          >
            자세히 보기 {noticeOpen ? "▴" : "▾"}
          </button>
          {noticeOpen && (
            <div className="flex flex-col gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div>
                <p className="font-semibold text-slate-700">1. 개인정보 수집 목적</p>
                <p>{PRIVACY_NOTICE.purpose}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">2. 수집항목</p>
                <p className="whitespace-pre-line">{PRIVACY_NOTICE.itemsCollected}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">3. 보유기간</p>
                <p>{PRIVACY_NOTICE.retentionPeriod}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">4. 동의 거부 시 안내</p>
                <p>{PRIVACY_NOTICE.refusalNotice}</p>
              </div>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
          />
          마케팅 정보 수신에 동의합니다
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-slate-900 py-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          {submitting ? "시작하는 중..." : "다음: 문항 시작하기"}
        </button>
      </form>
    </main>
  );
}
