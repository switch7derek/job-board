import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  type Locale,
  defaultLocale,
  getTranslations,
  t as translate,
} from "./index";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof ReturnType<typeof getTranslations>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) {
      return initialLocale;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("locale") as Locale | null;
      if (stored && (stored === "en" || stored === "es")) {
        return stored;
      }
    }
    return defaultLocale;
  });

  useEffect(() => {
    if (initialLocale) {
      setLocaleState(initialLocale);
      if (typeof window !== "undefined") {
        localStorage.setItem("locale", initialLocale);
        document.documentElement.lang = initialLocale;
      }
    }
  }, [initialLocale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: keyof ReturnType<typeof getTranslations>) => {
    return translate(key, locale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
