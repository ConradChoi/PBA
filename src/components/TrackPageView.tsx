"use client";

import { useEffect } from "react";
import type { AnalyticsEventName } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/ga4";

export function TrackPageView({ event }: { event: AnalyticsEventName }) {
  useEffect(() => {
    trackEvent(event);
  }, [event]);

  return null;
}
