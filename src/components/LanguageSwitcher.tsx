import { useI18n } from "../i18n/context";
import type { Locale } from "../i18n/index";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="language-switcher">
      <label htmlFor="language-select" className="language-label">
        {t("language")}:
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="language-select"
        aria-label={t("language")}
      >
        <option value="en">{t("english")}</option>
        <option value="es">{t("spanish")}</option>
      </select>
    </div>
  );
}
