"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/ga4";

export function ConsultingCtaLink({ assessmentId }: { assessmentId: string }) {
  return (
    <Link
      href={`/diagnose/result/${assessmentId}/consult`}
      onClick={() => trackEvent("radar_consulting_click")}
      className="block rounded-full bg-slate-900 py-4 text-center text-sm font-semibold text-white"
    >
      내 사업 구조 상담하기
    </Link>
  );
}
