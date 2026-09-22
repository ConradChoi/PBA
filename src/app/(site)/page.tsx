import { getTranslations } from "next-intl/server";
import { TrackPageView } from "@/components/TrackPageView";

export default async function HomePage() {
  const t = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  return (
    <main className="mx-auto flex w-full flex-1 max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <TrackPageView event="radar_landing_view" />
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        {tCommon("brand")}
      </p>
      <h1 className="text-3xl font-bold sm:text-4xl">{t("headline")}</h1>
      <p className="text-lg text-slate-600">{t("subhead")}</p>
      <a
        href="/diagnose"
        className="rounded-full bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-700"
      >
        {t("cta")}
      </a>
      <ul className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
        <li>{t("stats.questionCount")}</li>
        <li>{t("stats.duration")}</li>
        <li>{t("stats.layerCount")}</li>
        <li>{t("stats.instantResult")}</li>
      </ul>
    </main>
  );
}
