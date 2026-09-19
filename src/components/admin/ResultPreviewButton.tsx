"use client";

import { useState } from "react";
import { Modal } from "./Modal";

// `children` is the server-rendered ResultReport, so the popup shows exactly
// what the customer sees without leaving the admin panel.
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
