"use client";

import { useState } from "react";
import { Modal } from "./Modal";

// `children` is the server-rendered ResultReport, always called with
// locale="ko" (see assessments/[assessmentId]/page.tsx) because the admin
// stays Korean regardless of which locale the assessment itself was taken
// in (assessments.locale). So this shows the Korean rendering of the
// customer's result without leaving the admin panel -- exactly what the
// customer saw only when their assessment was also ko; for any other
// locale it is a Korean-language preview of the same data, by design.
export function ResultPreviewButton({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit text-sm font-semibold text-indigo-600"
      >
        고객 결과 화면 보기
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="고객 결과 화면" size="lg">
        <div className="flex flex-col gap-8">{children}</div>
      </Modal>
    </>
  );
}
