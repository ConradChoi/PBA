import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { resolveLocale } from "./locales";

export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale({
    cookie: cookieStore.get("NEXT_LOCALE")?.value ?? null,
    acceptLanguage: headerStore.get("accept-language"),
    // Amplify sits behind CloudFront; the header is absent if it isn't
    // forwarded, and the browser language alone still decides.
    country: headerStore.get("cloudfront-viewer-country"),
  });

  return {
    locale,
    messages: (await import(`./messages/${locale}.ts`)).default,
  };
});
