"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/ga4";

export function TrackResultView({ architectureLevel }: { architectureLevel: string }) {
  useEffect(() => {
    trackEvent("radar_result_view", { architecture_level: architectureLevel });
  }, [architectureLevel]);

  return null;
}
