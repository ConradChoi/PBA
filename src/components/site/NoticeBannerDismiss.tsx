"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "dismissed-notice-id";

export function NoticeBannerDismiss({
  noticeId,
  dismissLabel,
  children,
}: {
  noticeId: string;
  dismissLabel: string;
  children: React.ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === noticeId);
    } catch {
      // Private mode or blocked storage: show the banner rather than break.
    }
  }, [noticeId]);

  if (dismissed) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 print:hidden">
      {children}
      <button
        type="button"
        aria-label={dismissLabel}
        onClick={() => {
          try {
            window.localStorage.setItem(STORAGE_KEY, noticeId);
          } catch {
            // Ignore: dismissal is a convenience, not state we depend on.
          }
          setDismissed(true);
        }}
        className="ml-auto rounded px-2 text-sm text-amber-900/60 hover:text-amber-900"
      >
        ×
      </button>
    </div>
  );
}
