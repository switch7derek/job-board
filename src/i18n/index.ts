import enTranslations from "./translations/en.json";
import esTranslations from "./translations/es.json";

export type Locale = "en" | "es";

export const defaultLocale: Locale = "en";
export const supportedLocales: Locale[] = ["en", "es"];

const translations: Record<Locale, typeof enTranslations> = {
  en: enTranslations,
  es: esTranslations,
};

export function getTranslations(locale: Locale = defaultLocale) {
  return translations[locale] || translations[defaultLocale];
}

export function t(
  key: keyof typeof enTranslations,
  locale: Locale = defaultLocale,
): string {
  const translation = getTranslations(locale);
  return translation[key] || key;
}
