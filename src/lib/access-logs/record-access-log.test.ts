import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AccessLogEntry } from "./build-access-log-entry";

const insert = vi.fn();
const createClient = vi.fn((..._args: unknown[]) => ({ from: () => ({ insert }) }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => createClient(...(args as [])),
}));

const entry: AccessLogEntry = {
  outcome: "denied",
  operator_id: null,
  operator_email: null,
  method: "GET",
  path: "/admin/assessments",
  subject_assessment_id: null,
  subject_consulting_request_id: null,
  ip: "203.0.113.7",
  user_agent: null,
};

beforeEach(() => {
  insert.mockReset();
  createClient.mockClear();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("recordAccessLog", () => {
  it("inserts the entry into admin_access_logs", async () => {
    insert.mockResolvedValue({ error: null });
    const { recordAccessLog } = await import("./record-access-log");

    await recordAccessLog(entry);

    expect(insert).toHaveBeenCalledWith(entry);
  });

  // The whole point of the try/catch: an operator must still be able to use
  // the admin panel when the log cannot be written.
  it("resolves instead of throwing when Supabase returns an error", async () => {
    insert.mockResolvedValue({ error: { message: "relation does not exist" } });
    const { recordAccessLog } = await import("./record-access-log");

    await expect(recordAccessLog(entry)).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it("resolves instead of throwing when the service-role key is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { recordAccessLog } = await import("./record-access-log");

    await expect(recordAccessLog(entry)).resolves.toBeUndefined();
    expect(insert).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("resolves instead of throwing when the insert itself rejects", async () => {
    insert.mockRejectedValue(new Error("fetch failed"));
    const { recordAccessLog } = await import("./record-access-log");

    await expect(recordAccessLog(entry)).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  // A database that is down is already handled above. This is the other half:
  // a database that is merely slow must not hold an awaited middleware write
  // open until the platform timeout, stalling every admin request behind it.
  it("gives up on a write that never settles, so the admin request continues", async () => {
    vi.useFakeTimers();
    insert.mockReturnValue(new Promise(() => {}));
    const { recordAccessLog, LOG_WRITE_TIMEOUT_MS } = await import("./record-access-log");

    const pending = recordAccessLog(entry);
    await vi.advanceTimersByTimeAsync(LOG_WRITE_TIMEOUT_MS);

    await expect(pending).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("abandoned"));
  });

  it("does not give up on a write that is merely in flight", async () => {
    vi.useFakeTimers();
    let settle: (value: { error: null }) => void = () => {};
    insert.mockReturnValue(new Promise((resolve) => (settle = resolve)));
    const { recordAccessLog, LOG_WRITE_TIMEOUT_MS } = await import("./record-access-log");

    const pending = recordAccessLog(entry);
    await vi.advanceTimersByTimeAsync(LOG_WRITE_TIMEOUT_MS - 1);
    settle({ error: null });

    await expect(pending).resolves.toBeUndefined();
    expect(console.error).not.toHaveBeenCalled();
  });

  // Abandoning the wait is not enough on its own: without a signal the
  // request stays open on the runtime after nobody is listening.
  it("also aborts the underlying request, not just the wait", async () => {
    insert.mockResolvedValue({ error: null });
    const { recordAccessLog, LOG_WRITE_TIMEOUT_MS } = await import("./record-access-log");

    await recordAccessLog(entry);

    const options = createClient.mock.calls[0]?.[2] as
      | { global?: { fetch?: typeof fetch } }
      | undefined;
    const wrappedFetch = options?.global?.fetch;
    expect(wrappedFetch, "the log client must install a fetch with a timeout").toBeTypeOf(
      "function"
    );

    const underlying = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 201 }));
    await wrappedFetch!("https://example.supabase.co/rest/v1/admin_access_logs");

    const init = underlying.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(init?.signal?.aborted).toBe(false);
    expect(LOG_WRITE_TIMEOUT_MS).toBeLessThanOrEqual(3000);
  });
});
