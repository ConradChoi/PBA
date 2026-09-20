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

const row = { id: "n1", title: "공지", body_html: "<p>내용</p>", is_published: true };

describe("listNotices", () => {
  it("returns every notice, newest first", async () => {
    const order = vi.fn().mockResolvedValue({ data: [row], error: null });
    from.mockReturnValueOnce({ select: () => ({ order }) });
    const { listNotices } = await import("./get-notices");

    expect(await listNotices()).toEqual([row]);
    expect(from).toHaveBeenCalledWith("notices");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});

describe("listPublishedNotices", () => {
  it("filters to published and orders by publish time", async () => {
    const order = vi.fn().mockResolvedValue({ data: [row], error: null });
    const eq = vi.fn(() => ({ order }));
    from.mockReturnValueOnce({ select: () => ({ eq }) });
    const { listPublishedNotices } = await import("./get-notices");

    expect(await listPublishedNotices()).toEqual([row]);
    expect(eq).toHaveBeenCalledWith("is_published", true);
    expect(order).toHaveBeenCalledWith("published_at", { ascending: false });
  });
});

describe("getPublishedNoticeById", () => {
  it("returns null for an unpublished notice", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eqPublished = vi.fn(() => ({ maybeSingle }));
    const eqId = vi.fn(() => ({ eq: eqPublished }));
    from.mockReturnValueOnce({ select: () => ({ eq: eqId }) });
    const { getPublishedNoticeById } = await import("./get-notices");

    expect(await getPublishedNoticeById("n1")).toBeNull();
    expect(eqId).toHaveBeenCalledWith("id", "n1");
    expect(eqPublished).toHaveBeenCalledWith("is_published", true);
  });
});

describe("createNotice", () => {
  it("stamps the operator and sets published_at when published", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "n1" }, error: null });
    const insert = vi.fn(() => ({ select: () => ({ single }) }));
    from.mockReturnValueOnce({ insert });
    const { createNotice } = await import("./get-notices");

    const id = await createNotice({
      title: "공지",
      bodyHtml: "<p>내용</p>",
      isPublished: true,
      isImportant: false,
      importantUntil: null,
      operatorEmail: "jhc@ylia.io",
    });

    expect(id).toBe("n1");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "공지",
        body_html: "<p>내용</p>",
        is_published: true,
        published_at: expect.any(String),
        created_by: "jhc@ylia.io",
        updated_by: "jhc@ylia.io",
      })
    );
  });

  it("leaves published_at null while hidden", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "n2" }, error: null });
    const insert = vi.fn(() => ({ select: () => ({ single }) }));
    from.mockReturnValueOnce({ insert });
    const { createNotice } = await import("./get-notices");

    await createNotice({
      title: "초안",
      bodyHtml: "<p>내용</p>",
      isPublished: false,
      isImportant: false,
      importantUntil: null,
      operatorEmail: "jhc@ylia.io",
    });

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ published_at: null }));
  });
});

describe("updateNotice", () => {
  it("sets published_at the first time a notice is published", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { published_at: null }, error: null });
    const eqSelect = vi.fn(() => ({ maybeSingle }));
    const eqUpdate = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq: eqUpdate }));
    from
      .mockReturnValueOnce({ select: () => ({ eq: eqSelect }) })
      .mockReturnValueOnce({ update });
    const { updateNotice } = await import("./get-notices");

    await updateNotice("n1", {
      title: "공지",
      bodyHtml: "<p>내용</p>",
      isPublished: true,
      isImportant: false,
      importantUntil: null,
      operatorEmail: "staff@ylia.io",
    });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        published_at: expect.any(String),
        updated_by: "staff@ylia.io",
      })
    );
    expect(eqUpdate).toHaveBeenCalledWith("id", "n1");
  });

  it("keeps the original published_at on a later edit", async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValue({ data: { published_at: "2026-09-01T00:00:00Z" }, error: null });
    const eqSelect = vi.fn(() => ({ maybeSingle }));
    const eqUpdate = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq: eqUpdate }));
    from
      .mockReturnValueOnce({ select: () => ({ eq: eqSelect }) })
      .mockReturnValueOnce({ update });
    const { updateNotice } = await import("./get-notices");

    await updateNotice("n1", {
      title: "공지",
      bodyHtml: "<p>수정</p>",
      isPublished: true,
      isImportant: false,
      importantUntil: null,
      operatorEmail: "staff@ylia.io",
    });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ published_at: "2026-09-01T00:00:00Z" })
    );
  });
});

describe("deleteNotice", () => {
  it("deletes by id", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    from.mockReturnValueOnce({ delete: () => ({ eq }) });
    const { deleteNotice } = await import("./get-notices");

    await deleteNotice("n1");

    expect(eq).toHaveBeenCalledWith("id", "n1");
  });
});
