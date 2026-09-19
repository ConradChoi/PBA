"use client";

import { useState } from "react";
import { PRIVACY_NOTICE } from "@/lib/content/privacy-notice";

export function PrivacyConsentField({
  checked,
  onChange,
  required = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}) {
  const [noticeOpen, setNoticeOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        개인정보 수집·이용에 동의합니다 {required ? "*" : "(선택)"}
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
  );
}
