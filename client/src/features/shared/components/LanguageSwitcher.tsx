import { useLanguage } from "@/lib/i18n/useLanguage";
import {
  isSupportedLanguage,
  SUPPORTED_LANGUAGES,
} from "@advanced-react/shared/i18n";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";

export function LanguageSwitcher() {
  const { t } = useTranslation("common");
  const { language, setLanguage } = useLanguage();
  return (
    <Select
      value={language}
      onValueChange={(value) => {
        if (isSupportedLanguage(value)) void setLanguage(value);
      }}
    >
      <SelectTrigger
        aria-label={t("language.label")}
        className="h-auto w-full justify-start gap-2 rounded-lg p-2 text-lg"
      >
        <Globe className="h-6 w-6" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map(({ code, nativeName }) => (
          <SelectItem key={code} value={code} lang={code}>
            {nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
