import {
  DEFAULT_LANGUAGE,
  LanguageCode,
  resolveLanguage,
  SUPPORTED_LANGUAGES_CODES,
  VALIDATION_LIMITS,
} from "@advanced-react/shared/i18n";
import { setupValidationErrorMap } from "@advanced-react/shared/schema/errorMap";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { loadDateFnsLocale } from "./dateLocale";
export const LANGUAGE_STORAGE_KEY = "language";
export const I18N_NAMESPACES = [
  "common",
  "ui",
  "auth",
  "experiences",
  "comments",
  "notifications",
  "users",
  "tags",
  "validation",
];
/**
 * Locale files are code-split per language and loaded on demand.
 *
 */
const loaders = {
  ...import.meta.glob("../../locales/*/*.json", { import: "default" }),
  ...import.meta.glob("../../../../shared/locales/*/*.json", {
    import: "default",
  }),
};
function localePath(language: string, namespace: string) {
  return namespace === "validation"
    ? `../../../../shared/locales/${language}/${namespace}.json`
    : `../../locales/${language}/${namespace}.json`;
}
setupValidationErrorMap();
export function getCurrentLanguage(): LanguageCode {
  return resolveLanguage(i18n.resolvedLanguage ?? i18n.language);
}
export async function setLanguage(language: LanguageCode) {
  await loadDateFnsLocale(language);
  await i18n.changeLanguage(language);
}
export const i18nReady = i18n
  .use(LanguageDetector)
  .use(
    resourcesToBackend(async (language: string, namespace: string) => {
      const load = loaders[localePath(language, namespace)];
      if (!load) throw new Error(`Missing Locale: ${language}/${namespace}`);
      return (await load()) as Record<string, unknown>;
    }),
  )
  .use(initReactI18next)
  .init({
    supportedLngs: SUPPORTED_LANGUAGES_CODES,
    fallbackLng: DEFAULT_LANGUAGE,
    ns: I18N_NAMESPACES,
    defaultNS: "common",
    load: "languageOnly",
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
      defaultVariables: VALIDATION_LIMITS,
    },
    react: {
      useSuspense: false,
    },
  })
  .then(loadDateFnsLocale(getCurrentLanguage()));
export default i18n;
