import { useLanguage } from "@/lib/i18n/useLanguage";
import { trpc } from "@/router";
import { DirectionProvider } from "@radix-ui/react-direction";
import { PropsWithChildren, useEffect } from "react";
import { useTranslation } from "react-i18next";

type LanguageProviderProps = PropsWithChildren & {};
export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n } = useTranslation();
  const { language, dir } = useLanguage();
  const utils = trpc.useUtils();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  useEffect(() => {
    const refetchTranslatedDate = () => {
      void utils.notifications.feed.invalidate();
    };
    i18n.on("languageChanged", refetchTranslatedDate);
    return () => {
      i18n.off("languageChanged", refetchTranslatedDate);
    };
  }, [i18n, utils]);
  return <DirectionProvider dir={dir}>{children}</DirectionProvider>;
}
