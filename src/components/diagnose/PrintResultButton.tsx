"use client";

import { trackEvent } from "@/lib/analytics/ga4";

// Opens the browser print dialog, where "Save as PDF" produces a crisp,
// text-selectable PDF using the print styles on the result page.
export function PrintResultButton() {
  return (
    <button
      type="button"
      onClick={() => {
        trackEvent("radar_pdf_request");
        window.print();
      }}
      className="rounded-full border border-slate-200 py-4 text-sm font-semibold text-slate-700"
    >
      결과 PDF 저장 · 인쇄
    </button>
  );
}
