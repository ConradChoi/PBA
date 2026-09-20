import { describe, expect, it } from "vitest";
import { noticeExcerpt, selectBannerNotice } from "./notice-view";
import type { NoticeRow } from "./types";

function notice(overrides: Partial<NoticeRow>): NoticeRow {
  return {
    id: "n1",
    title: "공지",
    body_html: "<p>내용</p>",
    is_published: true,
    published_at: "2026-09-20T00:00:00Z",
    is_important: true,
    important_until: "2026-09-30",
    created_by: "jhc@ylia.io",
    updated_by: "jhc@ylia.io",
    created_at: "2026-09-20T00:00:00Z",
    updated_at: "2026-09-20T00:00:00Z",
    ...overrides,
  };
}

describe("noticeExcerpt", () => {
  it("strips tags and collapses whitespace", () => {
    expect(noticeExcerpt("<h2>제목</h2>\n<p>본문 <strong>강조</strong></p>")).toBe("제목 본문 강조");
  });

  it("caps the length and adds an ellipsis", () => {
    const long = `<p>${"가".repeat(200)}</p>`;

    const result = noticeExcerpt(long, 120);

    expect(result).toHaveLength(121);
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("selectBannerNotice", () => {
  const today = "2026-09-20";

  it("returns null when there is nothing important and current", () => {
    expect(selectBannerNotice([], today)).toBeNull();
    expect(selectBannerNotice([notice({ is_published: false })], today)).toBeNull();
    expect(selectBannerNotice([notice({ is_important: false })], today)).toBeNull();
    expect(selectBannerNotice([notice({ important_until: null })], today)).toBeNull();
    expect(selectBannerNotice([notice({ important_until: "2026-09-19" })], today)).toBeNull();
  });

  it("keeps a notice whose important window ends today", () => {
    expect(selectBannerNotice([notice({ important_until: today })], today)?.id).toBe("n1");
  });

  it("returns the most recently published candidate", () => {
    const older = notice({ id: "old", published_at: "2026-09-01T00:00:00Z" });
    const newer = notice({ id: "new", published_at: "2026-09-19T00:00:00Z" });

    expect(selectBannerNotice([older, newer], today)?.id).toBe("new");
  });
});
