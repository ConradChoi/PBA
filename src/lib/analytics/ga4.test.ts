import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "./ga4";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("trackEvent", () => {
  it("does nothing when window is unavailable (SSR)", () => {
    expect(() => trackEvent("radar_landing_view")).not.toThrow();
  });

  it("does nothing when window.gtag is unavailable (e.g. ad blocker)", () => {
    vi.stubGlobal("window", {});
    expect(() => trackEvent("radar_landing_view")).not.toThrow();
  });

  it("calls window.gtag with the event name and params", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });

    trackEvent("radar_start", { business_stage: "idea" });

    expect(gtag).toHaveBeenCalledWith("event", "radar_start", {
      business_stage: "idea",
    });
  });

  it("defaults params to an empty object", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });

    trackEvent("radar_landing_view");

    expect(gtag).toHaveBeenCalledWith("event", "radar_landing_view", {});
  });
});
