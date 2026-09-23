import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getPublishedNoticeById } from "@/lib/notices/get-notices";
import { formatDate } from "@/lib/content/format-date";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ noticeId: string }>;
}) {
  const { noticeId } = await params;
  const notice = await getPublishedNoticeById(noticeId);

  if (!notice) {
    notFound();
  }

  const t = await getTranslations("common");
  const locale = await getLocale();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Link href="/notice" className="text-sm text-slate-500">
          {t("noticeBackToList")}
        </Link>
        <h1 className="text-2xl font-bold">{notice.title}</h1>
        <p className="text-xs text-slate-400">
          {notice.published_at ? formatDate(notice.published_at, locale) : ""}
        </p>
      </div>

      {/* Stored HTML is sanitized server-side on save (sanitize-notice-html.ts). */}
      <div
        className="notice-body flex flex-col gap-3 text-sm leading-relaxed text-slate-700"
        dangerouslySetInnerHTML={{ __html: notice.body_html }}
      />
    </main>
  );
}
