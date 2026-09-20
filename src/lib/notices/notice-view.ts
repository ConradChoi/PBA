import type { NoticeRow } from "./types";

export function noticeExcerpt(html: string, max = 120): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// The banner shows one notice: published, flagged important, and still inside
// its important window (which runs through the end of `important_until`).
export function selectBannerNotice(
  notices: NoticeRow[],
  today: string
): NoticeRow | null {
  const candidates = notices.filter(
    (notice) =>
      notice.is_published &&
      notice.is_important &&
      notice.important_until !== null &&
      notice.important_until >= today
  );

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((a, b) =>
    (b.published_at ?? "").localeCompare(a.published_at ?? "")
  )[0];
}
