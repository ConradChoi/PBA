import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MaskedPageLocation } from "@/components/analytics/MaskedPageLocation";
import { PublicOnly } from "@/components/site/PublicOnly";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "PBA 7-Layer Business Radar",
  description: "5분이면 현재 사업의 구조적 병목을 확인할 수 있습니다.",
};

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col">
        {gaMeasurementId ? (
          <>
            <GoogleAnalytics measurementId={gaMeasurementId} />
            <Suspense fallback={null}>
              <MaskedPageLocation />
            </Suspense>
          </>
        ) : null}
        <PublicOnly>
          <SiteHeader />
        </PublicOnly>
        <div className="flex flex-1 flex-col">{children}</div>
        <PublicOnly>
          <SiteFooter />
        </PublicOnly>
      </body>
    </html>
  );
}
