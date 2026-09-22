import type { Locale as AppLocale } from "./locales";

// next-intl's server/client APIs (getLocale(), useLocale(), etc.) type their
// return value from use-intl's `AppConfig["Locale"]`, which defaults to
// `string` until the app augments it here. Doing this once lets every call
// site get `Locale` for free instead of casting `getLocale()`'s result.
declare module "use-intl" {
  interface AppConfig {
    Locale: AppLocale;
  }
}
