import type { Metadata } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MaskedPageLocation } from "@/components/analytics/MaskedPageLocation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NotFoundContent } from "@/components/site/NotFoundContent";
import "./globals.css";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Renders for any URL that matches no route at all. Requires
// `experimental.globalNotFound` in next.config.ts and must live at the true
// app root (not inside (site)) -- this is Next's supported answer to having
// multiple root layouts (see (site)/layout.tsx and admin/layout.tsx) and no
// single one left to own the unmatched-route case. Unlike that built-in
// default, this one defines its own <html>/<body>, so it has to rebuild the
// same chrome (site)/layout.tsx gives every other public page: `lang`, GA,
// header/footer, and the client message tree -- rather than reuse
// SiteLayout directly, since a root layout component can't be nested inside
// another <html>.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return { title: t("siteTitle"), description: t("siteDescription") };
}

export default async function GlobalNotFound() {
  const locale = await getLocale();
  const messages = await getMessages();
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
          <div className="flex flex-1 flex-col">
            <NotFoundContent />
          </div>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
