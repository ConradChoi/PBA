import { afterEach, describe, expect, it, vi } from "vitest";
import { createBrowserSupabaseClient } from "./client";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createBrowserSupabaseClient", () => {
  it("throws when required env vars are missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(() => createBrowserSupabaseClient()).toThrow(
      "Missing Supabase client environment variables"
    );
  });

  it("creates a client when both env vars are present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

    expect(() => createBrowserSupabaseClient()).not.toThrow();
  });
});
