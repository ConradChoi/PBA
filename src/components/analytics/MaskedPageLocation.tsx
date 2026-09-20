"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { maskAnalyticsPath } from "@/lib/analytics/mask-path";

// The inline gtag snippet in GoogleAnalytics only masks the location at the
// initial full page load. This app navigates between assessment/result/
// consult pages with router.push, which does not re-run that inline script,
// so gtag's stored page_location would keep pointing at the URL from the
// original load (or a live, unmasked one if GA's own history listener picks
// up the change). Re-apply the mask on every client-side route change so no
// later event — automatic page_view or a manual trackEvent — ever carries an
// assessment id.
export function MaskedPageLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }

    const search = searchParams.toString();
    const masked = maskAnalyticsPath(pathname);

    window.gtag("set", {
      page_path: masked,
      page_location:
        window.location.origin + masked + (search ? `?${search}` : ""),
    });
  }, [pathname, searchParams]);

  return null;
}
