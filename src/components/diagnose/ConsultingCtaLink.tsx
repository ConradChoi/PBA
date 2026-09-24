"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics/ga4";

export function ConsultingCtaLink({ assessmentId }: { assessmentId: string }) {
  const t = useTranslations("result");

  return (
    <Link
      href={`/diagnose/result/${assessmentId}/consult`}
      onClick={() => trackEvent("radar_consulting_click")}
      className="block rounded-full bg-slate-900 py-4 text-center text-sm font-semibold text-white"
    >
      {t("sessionOffer.cta")}
    </Link>
  );
}
