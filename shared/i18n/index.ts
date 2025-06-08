export const SUPPORTED_LANGUAGES = [
  {
    code: "en",
    nativeName: "English",
    dir: "ltr",
    intlLocale: "en-US",
  },
  {
    code: "ar",
    nativeName: "العربية",
    dir: "rtl",
    intlLocale: "ar-u-nu-latn",
  },
] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
export type LanguageDirection = (typeof SUPPORTED_LANGUAGES)[number]["dir"];
export type IntlLocale = (typeof SUPPORTED_LANGUAGES)[number]["intlLocale"];
export const SUPPORTED_LANGUAGES_CODES: LanguageCode[] =
  SUPPORTED_LANGUAGES.map((language) => language.code);
export const DEFAULT_LANGUAGE: LanguageCode = "en";

export const VALIDATION_LIMITS = {
  nameMin: 3,
  passwordMin: 8,
} as const;

export const VALIDATION_KEY_PREFIX = "validation:";

export function isSupportedLanguage(code: string): code is LanguageCode {
  return SUPPORTED_LANGUAGES.some((language) => language.code === code);
}

export function resolveLanguage(code?: string | null): LanguageCode {
  if (!code) return DEFAULT_LANGUAGE;
  const base = code.split("-")[0].toLowerCase();
  return isSupportedLanguage(base) ? base : DEFAULT_LANGUAGE;
}

export function getLanguageConfig(code: LanguageCode) {
  return (
    SUPPORTED_LANGUAGES.find((language) => language.code === code) ??
    SUPPORTED_LANGUAGES[0]
  );
}
export function isValidationKey(message: string): boolean {
  return message.startsWith(VALIDATION_KEY_PREFIX);
}
export function translateValidationMessage(
  translate: (key: string) => string,
  message: string,
): string {
  return isValidationKey(message) ? translate(message) : message;
}
