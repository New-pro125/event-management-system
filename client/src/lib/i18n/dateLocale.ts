import { LanguageCode } from "@advanced-react/shared/i18n";
import { Locale } from "date-fns";

const loaders: Record<LanguageCode, () => Promise<Locale>> = {
  en: () => import("date-fns/locale/en-US").then((module) => module.enUS),
  ar: () => import("date-fns/locale/ar").then((module) => module.ar),
};
const cache = new Map<LanguageCode, Locale>();
export async function loadDateFnsLocale(language: LanguageCode) {
  const cached = cache.get(language);
  if (cached) return cached;
  const locale = await loaders[language]();
  cache.set(language, locale);
  return locale;
}
export function getDateFnsLocale(language: LanguageCode) {
  return cache.get(language);
}
