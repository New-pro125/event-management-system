import { LanguageCode, LanguageDirection } from "@advanced-react/shared/i18n";
import { Locale } from "date-fns";
import { getDateFnsLocale } from "./dateLocale";
import { useLanguage } from "./useLanguage";

interface useFormattersResult {
  language: LanguageCode;
  formatDateTime: (value: string | number | Date) => string;
  dateFnsLocale: Locale | undefined;
  dir: LanguageDirection;
}
export function useFormatters(): useFormattersResult {
  const { language, intlLocale, dir } = useLanguage();
  const formatDateTime = (value: string | number | Date) =>
    new Date(value).toLocaleString(intlLocale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  return {
    dir,
    language,
    formatDateTime,
    dateFnsLocale: getDateFnsLocale(language),
  };
}
