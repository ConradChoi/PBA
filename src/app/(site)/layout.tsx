import type { Metadata } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MaskedPageLocation } from "@/components/analytics/MaskedPageLocation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NoticeBanner } from "@/components/site/NoticeBanner";
import "../globals.css";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return { title: t("siteTitle"), description: t("siteDescription") };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  // The browser only needs what client components read; the policy text and
  // page metadata are rendered on the server.
  const { privacy: _privacy, metadata: _metadata, ...clientMessages } = messages as Record<
    string,
    unknown
  >;

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        {gaMeasurementId ? (
          <>
            <GoogleAnalytics measurementId={gaMeasurementId} />
            <Suspense fallback={null}>
              <MaskedPageLocation />
            </Suspense>
          </>
        ) : null}
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <SiteHeader />
          <NoticeBanner />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
