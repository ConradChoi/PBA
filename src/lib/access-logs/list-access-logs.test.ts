import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  accessLogRangeStart,
  ACCESS_LOG_MAX_ROWS,
  DEFAULT_ACCESS_LOG_RANGE,
  listAccessLogs,
  parseAccessLogRange,
  summarizeAccessLogs,
} from "./list-access-logs";

const from = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

const row = {
  id: "l1",
  occurred_at: "2026-09-24T01:00:00Z",
  outcome: "granted",
  operator_id: "o1",
  operator_email: "owner@ylia.io",
  method: "GET",
  path: "/admin/assessments",
  subject_assessment_id: null,
  subject_consulting_request_id: null,
  ip: "203.0.113.7",
  user_agent: null,
};

// A stand-in for the PostgREST builder: every filter records what it was
// asked for and returns itself, and awaiting it yields the canned response.
function builder(response: { data?: unknown; error?: unknown; count?: number | null }) {
  const calls: { method: string; args: unknown[] }[] = [];
  const settled = Promise.resolve({ data: null, error: null, count: null, ...response });

  const chain: Record<string, unknown> = {
    calls,
    then: settled.then.bind(settled),
  };

  for (const method of ["select", "gte", "eq", "or", "order", "limit"]) {
    chain[method] = (...args: unknown[]) => {
      calls.push({ method, args });
      return chain;
    };
  }

  return chain as typeof chain & { calls: typeof calls };
}

function argsFor(chain: { calls: { method: string; args: unknown[] }[] }, method: string) {
  return chain.calls.filter((call) => call.method === method).map((call) => call.args);
}

beforeEach(() => {
  from.mockReset();
});

describe("parseAccessLogRange", () => {
  it("accepts the ranges the screen offers", () => {
    expect(parseAccessLogRange("7d")).toBe("7d");
    expect(parseAccessLogRange("13m")).toBe("13m");
  });

  // The range arrives from the URL, so it is whatever anyone types.
  it("falls back to the default for anything else", () => {
    expect(parseAccessLogRange("everything")).toBe(DEFAULT_ACCESS_LOG_RANGE);
    expect(parseAccessLogRange(undefined)).toBe(DEFAULT_ACCESS_LOG_RANGE);
    // An inherited key is not a range: accepting it would give the query an
    // Invalid Date and the owner a 500 instead of a screen.
    expect(parseAccessLogRange("toString")).toBe(DEFAULT_ACCESS_LOG_RANGE);
    expect(parseAccessLogRange("constructor")).toBe(DEFAULT_ACCESS_LOG_RANGE);
  });

  // The screen's whole purpose is a monthly inspection; landing on a window
  // shorter than a month would make the default view answer the wrong
  // question.
  it("defaults to a window that covers a month", () => {
    const now = new Date("2026-09-24T00:00:00Z");
    const days =
      (now.getTime() - accessLogRangeStart(DEFAULT_ACCESS_LOG_RANGE, now).getTime()) /
      (24 * 60 * 60 * 1000);

    expect(days).toBeGreaterThanOrEqual(30);
  });

  it("reaches the whole 13-month retention on its widest setting", () => {
    const now = new Date("2026-09-24T00:00:00Z");
    const days = (now.getTime() - accessLogRangeStart("13m", now).getTime()) / (24 * 60 * 60 * 1000);

    expect(days).toBeGreaterThanOrEqual(396);
  });
});

describe("listAccessLogs", () => {
  it("returns rows newest first, bounded by the date range and the row cap", async () => {
    const chain = builder({ data: [row], count: 1 });
    from.mockReturnValueOnce(chain);

    const result = await listAccessLogs({ range: "30d", now: new Date("2026-09-24T00:00:00Z") });

    expect(result.rows).toEqual([row]);
    expect(result.total).toBe(1);
    expect(from).toHaveBeenCalledWith("admin_access_logs");
    expect(argsFor(chain, "order")).toEqual([["occurred_at", { ascending: false }]]);
    expect(argsFor(chain, "limit")).toEqual([[ACCESS_LOG_MAX_ROWS]]);
    expect(argsFor(chain, "gte")).toEqual([["occurred_at", "2026-08-25T00:00:00.000Z"]]);
  });

  // The count has to come from the database, not from rows.length: a capped
  // table would otherwise report the cap as the truth.
  it("reports the true match count even when the rows are capped", async () => {
    const chain = builder({ data: [row], count: 4821 });
    from.mockReturnValueOnce(chain);

    const result = await listAccessLogs();

    expect(result.total).toBe(4821);
    expect(argsFor(chain, "select")).toEqual([["*", { count: "exact" }]]);
  });

  // Filtering in the browser would filter only the rows that survived the
  // cap, which on a scanner-heavy month is the wrong 500 rows.
  it("filters by outcome and account in the database", async () => {
    const chain = builder({ data: [], count: 0 });
    from.mockReturnValueOnce(chain);

    await listAccessLogs({ outcome: "forbidden", account: "staff@ylia.io" });

    expect(argsFor(chain, "eq")).toEqual([
      ["outcome", "forbidden"],
      ["operator_email", "staff@ylia.io"],
    ]);
  });

  it("applies no outcome or account filter for 'all'", async () => {
    const chain = builder({ data: [], count: 0 });
    from.mockReturnValueOnce(chain);

    await listAccessLogs({ outcome: "all", account: "all" });

    expect(argsFor(chain, "eq")).toEqual([]);
  });

  it("can narrow to requests that touched an identifiable person", async () => {
    const chain = builder({ data: [], count: 0 });
    from.mockReturnValueOnce(chain);

    await listAccessLogs({ subjectOnly: true });

    expect(argsFor(chain, "or")).toEqual([
      ["subject_assessment_id.not.is.null,subject_consulting_request_id.not.is.null"],
    ]);
  });

  it("throws when the query fails, rather than showing an empty log as if nothing happened", async () => {
    from.mockReturnValueOnce(builder({ data: null, error: { message: "boom" } }));

    await expect(listAccessLogs()).rejects.toThrow("boom");
  });
});

describe("summarizeAccessLogs", () => {
  it("counts each outcome in the database, so a spike is visible above the row cap", async () => {
    const chains = [
      builder({ count: 120 }),
      builder({ count: 9300 }),
      builder({ count: 4 }),
    ];
    chains.forEach((chain) => from.mockReturnValueOnce(chain));

    const summary = await summarizeAccessLogs({ range: "30d" });

    expect(summary).toEqual({ granted: 120, denied: 9300, forbidden: 4 });
    for (const chain of chains) {
      expect(argsFor(chain, "select")).toEqual([["id", { count: "exact", head: true }]]);
    }
    expect(chains.flatMap((chain) => argsFor(chain, "eq"))).toEqual([
      ["outcome", "granted"],
      ["outcome", "denied"],
      ["outcome", "forbidden"],
    ]);
  });

  it("throws when a count fails", async () => {
    from
      .mockReturnValueOnce(builder({ count: 1 }))
      .mockReturnValueOnce(builder({ error: { message: "boom" } }))
      .mockReturnValueOnce(builder({ count: 1 }));

    await expect(summarizeAccessLogs()).rejects.toThrow("boom");
  });
});
