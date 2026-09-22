import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, resolveLocale } from "./locales";

export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale({
    cookie: cookieStore.get("NEXT_LOCALE")?.value ?? null,
    acceptLanguage: headerStore.get("accept-language"),
    // Amplify sits behind CloudFront; the header is absent if it isn't
    // forwarded, and the browser language alone still decides.
    country: headerStore.get("cloudfront-viewer-country"),
  });

  // Message loading must be total: a locale that resolveLocale can return
  // but whose messages module doesn't exist yet (or fails to load) must not
  // take the whole request down. Fall back to the default locale's messages
  // and report that locale too, so `<html lang>` doesn't claim a language
  // whose strings didn't actually load.
  try {
    return {
      locale,
      messages: (await import(`./messages/${locale}`)).default,
    };
  } catch (error) {
    console.error(`i18n: no messages for ${locale}, falling back to ${DEFAULT_LOCALE}`, error);
    return {
      locale: DEFAULT_LOCALE,
      messages: (await import(`./messages/${DEFAULT_LOCALE}`)).default,
    };
  }
});
