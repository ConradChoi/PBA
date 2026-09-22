import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, resolveLocale } from "./locales";

async function resolveLocaleFromRequest() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return resolveLocale({
    cookie: cookieStore.get("NEXT_LOCALE")?.value ?? null,
    acceptLanguage: headerStore.get("accept-language"),
    // Amplify sits behind CloudFront; the header is absent if it isn't
    // forwarded, and the browser language alone still decides.
    country: headerStore.get("cloudfront-viewer-country"),
  });
}

export default getRequestConfig(async ({ requestLocale }) => {
  // An explicit override -- e.g. `getTranslations({ locale: "ko", ... })`,
  // which the admin result preview uses to force Korean regardless of the
  // visitor's resolved locale -- arrives here via `requestLocale`. Honor it
  // directly instead of re-deriving a locale from the request, both because
  // the caller's choice should win and because resolving from the request
  // reads cookies()/headers(), which aren't available outside one (e.g. a
  // plain `getTranslations({ locale })` call in a test).
  const overrideLocale = await requestLocale;
  const locale = isLocale(overrideLocale) ? overrideLocale : await resolveLocaleFromRequest();

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
