import type { AnalyticsEventName } from "./events";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: AnalyticsEventName,
  params: Record<string, string | number | boolean> = {}
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", name, params);
}
