import {
  getLanguageConfig,
  IntlLocale,
  LanguageCode,
  LanguageDirection,
  resolveLanguage,
} from "@advanced-react/shared/i18n";
import { useTranslation } from "react-i18next";
import { setLanguage } from ".";
interface UseLanguageResult {
  language: LanguageCode;
  dir: LanguageDirection;
  intlLocale: IntlLocale;
  setLanguage: (language: LanguageCode) => Promise<void>;
}
// interface UseLanguageOptions {}
export function useLanguage(): UseLanguageResult {
  const { i18n } = useTranslation();
  const language = resolveLanguage(i18n.resolvedLanguage);
  const { dir, intlLocale } = getLanguageConfig(language);
  return { language, dir, intlLocale, setLanguage };
}
