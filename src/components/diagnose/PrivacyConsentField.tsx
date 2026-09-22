"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function PrivacyConsentField({
  checked,
  onChange,
  required = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}) {
  const t = useTranslations("basicInfo");
  const [noticeOpen, setNoticeOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        {required ? t("consent.checkboxRequired") : t("consent.checkboxOptional")}
      </label>
      <p className="text-xs text-slate-500">{t("consent.summary")}</p>
      <button
        type="button"
        onClick={() => setNoticeOpen((v) => !v)}
        className="w-fit text-xs font-semibold text-indigo-600"
      >
        {t("consent.details")} {noticeOpen ? "▴" : "▾"}
      </button>
      {noticeOpen && (
        <div className="flex flex-col gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-700">{t("consent.purposeTitle")}</p>
            <p>{t("consent.purpose")}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">{t("consent.itemsTitle")}</p>
            <p className="whitespace-pre-line">{t("consent.itemsCollected")}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">{t("consent.retentionTitle")}</p>
            <p>{t("consent.retentionPeriod")}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">{t("consent.refusalTitle")}</p>
            <p>{t("consent.refusalNotice")}</p>
          </div>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit font-semibold text-indigo-600 underline"
          >
            {t("consent.fullPolicy")}
          </a>
        </div>
      )}
    </div>
  );
}
