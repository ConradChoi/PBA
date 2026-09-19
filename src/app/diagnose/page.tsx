"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics/ga4";
import { PrivacyConsentField } from "@/components/diagnose/PrivacyConsentField";
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    businessStage &&
    (businessStage !== "other" || businessStageOther.trim()) &&
    (!privacyConsent || (name && email)) &&
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
          // Personal fields are sent only with privacy consent (anonymous
          // diagnosis otherwise); the server drops them regardless.
          ...(privacyConsent && {
            name,
            email,
            companyName: companyName || undefined,
            role: role || undefined,
          }),
          businessStage,
          businessStageOther:
            businessStage === "other" ? businessStageOther : undefined,
          industry: industry || undefined,
          teamSize: teamSize || undefined,
        },
        privacyConsent,
        marketingConsent: privacyConsent && marketingConsent,
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

        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500">
            동의하시면 결과 PDF와 상담 안내를 이메일로 받으실 수 있습니다. 동의하지
            않으셔도 진단과 결과 확인은 그대로 이용하실 수 있습니다.
          </p>
          <PrivacyConsentField checked={privacyConsent} onChange={setPrivacyConsent} />
        </div>

        {privacyConsent && (
          <>
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

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
              />
              마케팅 정보 수신에 동의합니다 (선택)
            </label>
          </>
        )}

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
