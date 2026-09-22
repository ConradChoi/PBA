"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics/ga4";
import { maskEmail } from "@/lib/content/mask-email";
import { PrivacyConsentField } from "./PrivacyConsentField";

export function ConsultForm({
  assessmentId,
  maskedEmail,
}: {
  assessmentId: string;
  // null for an anonymous diagnosis: the form then collects contact details.
  maskedEmail: string | null;
}) {
  const t = useTranslations("consult");
  const isAnonymous = maskedEmail === null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !canSubmit) return;

    setSubmitting(true);
    setError(null);

    const response = await fetch(`/api/assessments/${assessmentId}/consulting-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message || undefined,
        ...(isAnonymous && { contact: { name, email, privacyConsent } }),
      }),
    });

    if (!response.ok) {
      setError(t("error"));
      setSubmitting(false);
      return;
    }

    trackEvent("radar_consulting_submit");
    setSubmitted(true);
  }

  const canSubmit = !isAnonymous || (name.trim() && email.trim() && privacyConsent);
  const contactEmail = isAnonymous ? maskEmail(email) : maskedEmail;

  if (submitted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-base font-semibold text-slate-900">{t("success.title")}</p>
          <p className="mt-2 text-sm text-slate-600">
            {t("success.description", { email: contactEmail })}
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full bg-slate-900 py-4 text-center text-sm font-semibold text-white"
        >
          {t("success.home")}
        </Link>
        <Link
          href={`/diagnose/result/${assessmentId}`}
          className="text-center text-sm font-semibold text-slate-600 underline"
        >
          {t("success.viewResult")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {isAnonymous ? (
        <>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">{t("anonymous.name")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("anonymous.namePlaceholder")}
              className="rounded-lg border border-slate-200 px-3.5 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">{t("anonymous.email")}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("anonymous.emailPlaceholder")}
              className="rounded-lg border border-slate-200 px-3.5 py-2.5"
            />
          </label>
        </>
      ) : (
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">{t("namedEmail.label")}</span>
          <p className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-slate-900">{maskedEmail}</p>
          <p className="text-xs text-slate-500">{t("namedEmail.notice")}</p>
        </div>
      )}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-slate-700">{t("message")}</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="rounded-lg border border-slate-200 px-3.5 py-2.5"
        />
      </label>

      {isAnonymous && (
        <PrivacyConsentField checked={privacyConsent} onChange={setPrivacyConsent} required />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="rounded-full bg-slate-900 py-4 text-sm font-semibold text-white disabled:opacity-40"
      >
        {submitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
