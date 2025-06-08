import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES_CODES,
  VALIDATION_LIMITS,
} from "@advanced-react/shared/i18n";
import arValidation from "@advanced-react/shared/locales/ar/validation.json";
import enValidation from "@advanced-react/shared/locales/en/validation.json";
import { setupValidationErrorMap } from "@advanced-react/shared/schema/errorMap";
import i18next from "i18next";
import { LanguageDetector } from "i18next-http-middleware";
import arErrors from "../locales/ar/errors.json";
import arNotifications from "../locales/ar/notifications.json";
import enErrors from "../locales/en/errors.json";
import enNotifications from "../locales/en/notifications.json";
setupValidationErrorMap();

/**
 * Resources are bundled, so i18next is initialized sync
 * Language resolved per request by (Accept-Language)
 */
void i18next.use(LanguageDetector).init({
  resources: {
    en: {
      errors: enErrors,
      notifications: enNotifications,
      validation: enValidation,
    },
    ar: {
      errors: arErrors,
      notifications: arNotifications,
      validation: arValidation,
    },
  },
  supportedLngs: SUPPORTED_LANGUAGES_CODES,
  fallbackLng: DEFAULT_LANGUAGE,
  ns: ["errors", "notifications", "validation"],
  defaultNS: "errors",
  initAsync: false,
  detection: {
    order: ["header"],
    lookupHeader: "accept-language",
  },
  interpolation: {
    escapeValue: false,
    defaultVariables: VALIDATION_LIMITS,
  },
});
export default i18next;
