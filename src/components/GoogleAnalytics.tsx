import Script from "next/script";
import { MASK_RULES_JS } from "@/lib/analytics/mask-path";

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          // A result URL's id is the only credential to view that result, so
          // it must never reach Google. gtag('set') applies to page_view and
          // to every later event.
          var maskRules = ${MASK_RULES_JS};
          var maskedPath = maskRules.reduce(function (path, rule) {
            return path.replace(new RegExp(rule[0]), rule[1]);
          }, location.pathname);
          gtag('set', {
            page_path: maskedPath,
            page_location: location.origin + maskedPath + location.search,
          });
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
