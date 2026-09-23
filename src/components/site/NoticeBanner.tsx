import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listPublishedNotices } from "@/lib/notices/get-notices";
import { selectBannerNotice } from "@/lib/notices/notice-view";
import { NoticeBannerDismiss } from "./NoticeBannerDismiss";

export async function NoticeBanner() {
  // This renders on every public page, so a notices query that fails (the
  // migration not applied yet, Supabase down) must cost the banner only --
  // never the page the visitor came for.
  let notices;
  try {
    notices = await listPublishedNotices();
  } catch (error) {
    console.error("notice banner: could not load notices", error);
    return null;
  }

  const t = await getTranslations("common");

  // Compare in KST: the banner should disappear the day after the operator's
  // chosen end date in their own timezone.
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const notice = selectBannerNotice(notices, today);

  if (!notice) {
    return null;
  }

  return (
    <NoticeBannerDismiss noticeId={notice.id} dismissLabel={t("noticeClose")}>
      <Link href={`/notice/${notice.id}`} className="text-sm font-medium text-amber-900">
        {notice.title}
      </Link>
    </NoticeBannerDismiss>
  );
}
