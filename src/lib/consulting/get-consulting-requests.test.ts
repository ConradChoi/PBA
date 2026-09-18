import { beforeEach, describe, expect, it, vi } from "vitest";

// Each function has a different query chain shape, so every test hands
// `from` the chain it needs via mockReturnValueOnce.
const from = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

beforeEach(() => {
  from.mockReset();
});

const row = {
  id: "r1",
  assessment_id: "a1",
  preferred_contact: "010",
  message: null,
  created_at: "2026-09-18T00:00:00Z",
  read_at: null,
};

describe("listConsultingRequests", () => {
  it("returns rows ordered newest first", async () => {
    const order = vi.fn().mockResolvedValue({ data: [row], error: null });
    from.mockReturnValueOnce({ select: () => ({ order }) });
    const { listConsultingRequests } = await import("./get-consulting-requests");

    const result = await listConsultingRequests();

    expect(result).toEqual([row]);
    expect(from).toHaveBeenCalledWith("consulting_requests");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});

describe("getConsultingRequestById", () => {
  it("returns the row when found", async () => {
    const eq = vi.fn(() => ({
      maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
    }));
    from.mockReturnValueOnce({ select: () => ({ eq }) });
    const { getConsultingRequestById } = await import("./get-consulting-requests");

    const result = await getConsultingRequestById("r1");

    expect(result?.id).toBe("r1");
    expect(eq).toHaveBeenCalledWith("id", "r1");
  });

  it("returns null when not found", async () => {
    const eq = vi.fn(() => ({
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }));
    from.mockReturnValueOnce({ select: () => ({ eq }) });
    const { getConsultingRequestById } = await import("./get-consulting-requests");

    expect(await getConsultingRequestById("missing")).toBeNull();
  });
});

describe("markConsultingRequestRead", () => {
  it("updates read_at only where it was null", async () => {
    const is = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn(() => ({ is }));
    const update = vi.fn(() => ({ eq }));
    from.mockReturnValueOnce({ update });
    const { markConsultingRequestRead } = await import("./get-consulting-requests");

    await markConsultingRequestRead("r1");

    expect(update).toHaveBeenCalledWith({ read_at: expect.any(String) });
    expect(eq).toHaveBeenCalledWith("id", "r1");
    expect(is).toHaveBeenCalledWith("read_at", null);
  });
});

describe("countUnreadConsultingRequests", () => {
  it("returns the unread count", async () => {
    const is = vi.fn().mockResolvedValue({ count: 3, error: null });
    const select = vi.fn(() => ({ is }));
    from.mockReturnValueOnce({ select });
    const { countUnreadConsultingRequests } = await import("./get-consulting-requests");

    expect(await countUnreadConsultingRequests()).toBe(3);
    expect(select).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(is).toHaveBeenCalledWith("read_at", null);
  });

  it("returns 0 when count is null", async () => {
    const is = vi.fn().mockResolvedValue({ count: null, error: null });
    from.mockReturnValueOnce({ select: () => ({ is }) });
    const { countUnreadConsultingRequests } = await import("./get-consulting-requests");

    expect(await countUnreadConsultingRequests()).toBe(0);
  });
});
