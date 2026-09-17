import { afterEach, describe, expect, it, vi } from "vitest";

// "server-only" throws when resolved outside the "react-server" condition,
// which Vitest's plain Node test environment does not set. The package is
// a marker with no behavior, so a no-op mock is the standard way to test
// modules that import it.
vi.mock("server-only", () => ({}));

const { createServiceRoleSupabaseClient } = await import("./server");

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createServiceRoleSupabaseClient", () => {
  it("throws when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    expect(() => createServiceRoleSupabaseClient()).toThrow(
      "Missing Supabase server environment variables"
    );
  });

  it("creates a client when both env vars are present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");

    expect(() => createServiceRoleSupabaseClient()).not.toThrow();
  });
});
