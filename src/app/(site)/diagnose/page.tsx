"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics/ga4";
import { PrivacyConsentField } from "@/components/diagnose/PrivacyConsentField";
import { BUSINESS_STAGE_VALUES } from "@/lib/content/business-stage";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { TEAM_SIZE_VALUES } from "@/lib/content/team-size";
import type { BusinessStage } from "@/lib/types/assessment";

export default function DiagnosePage() {
  const router = useRouter();
  const t = useTranslations("basicInfo");
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

  const businessStageOptions = BUSINESS_STAGE_VALUES.map((value) => ({
    value,
    label: t(`stages.${value}`),
  }));
  const teamSizeOptions = TEAM_SIZE_VALUES.map((value) => ({
    value,
    label: t(`teamSizes.${value}`),
  }));

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
      setError(t("error"));
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
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-700">{t("businessStage")}</span>
          <ChipGroup
            name="businessStage"
            label={t("businessStage")}
            options={businessStageOptions}
            value={businessStage}
            onChange={setBusinessStage}
          />
        </div>

        {businessStage === "other" && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">{t("businessStageOther")}</span>
            <input
              value={businessStageOther}
              onChange={(e) => setBusinessStageOther(e.target.value)}
              placeholder={t("businessStageOtherPlaceholder")}
              className="rounded-lg border border-slate-200 px-3.5 py-2.5"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">{t("industry")}</span>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-700">{t("teamSize")}</span>
          <ChipGroup
            name="teamSize"
            label={t("teamSize")}
            options={teamSizeOptions}
            value={teamSize}
            onChange={setTeamSize}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500">{t("consentIntro")}</p>
          <PrivacyConsentField checked={privacyConsent} onChange={setPrivacyConsent} />
        </div>

        {privacyConsent && (
          <>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">{t("name")}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className="rounded-lg border border-slate-200 px-3.5 py-2.5"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">{t("email")}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="rounded-lg border border-slate-200 px-3.5 py-2.5"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">{t("companyName")}</span>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="rounded-lg border border-slate-200 px-3.5 py-2.5"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700">{t("role")}</span>
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
              {t("marketingConsent")}
            </label>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-slate-900 py-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          {submitting ? t("submitting") : t("submit")}
        </button>
      </form>
    </main>
  );
}
