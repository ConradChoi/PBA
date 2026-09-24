import { getTranslations } from "next-intl/server";
import { ConsultingCtaLink } from "@/components/diagnose/ConsultingCtaLink";

const INCLUDES = ["cause", "roadmap", "scope"] as const;

// 결과 페이지 끝에 붙는 유료 세션 제안. ResultReport가 아니라 결과 페이지
// 쪽에 두는 이유는 기존 CTA와 같다 -- ResultReport는 어드민 미리보기와
// 공유하는 본문이고, CTA·GA4는 호출하는 화면이 각자 들고 있다.
//
// print:hidden을 붙이지 않는 것이 이 블록의 핵심이다. PDF는 회사 안에서
// 돌려보는 자료라 가격이 같이 따라가야 한다(SessionOffer.test.tsx).
export async function SessionOffer({ assessmentId }: { assessmentId: string }) {
  const t = await getTranslations("result");
  const bold = (chunks: React.ReactNode) => (
    <strong className="font-semibold text-slate-900">{chunks}</strong>
  );

  return (
    <section className="flex flex-col gap-3 break-inside-avoid">
      <h2 className="text-lg font-bold">{t("sessionOffer.heading")}</h2>
      <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-slate-50 p-5">
        <div className="flex flex-col gap-1">
          <p className="text-base font-bold text-slate-900">
            {t("sessionOffer.priceLine")}{" "}
            <span className="text-xs font-medium text-slate-500">
              {t("sessionOffer.vatNote")}
            </span>
          </p>
          <p className="text-xs text-slate-600">{t("sessionOffer.format")}</p>
        </div>

        <p className="text-sm leading-relaxed text-slate-700">
          {t.rich("sessionOffer.body", { b: bold })}
        </p>

        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-slate-700">
          {INCLUDES.map((item) => (
            <li key={item}>{t.rich(`sessionOffer.includes.${item}`, { b: bold })}</li>
          ))}
        </ul>


        <div className="flex flex-col gap-2">
          <ConsultingCtaLink assessmentId={assessmentId} />
          <p className="text-center text-xs text-slate-500">{t("sessionOffer.ctaNote")}</p>
        </div>
      </div>
    </section>
  );
}
