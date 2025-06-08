import { useTranslation } from "react-i18next";

function toKey(name: string) {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join("");
}
export function useTagLabel() {
  const { t } = useTranslation("tags");
  return (tag: { name: string }) =>
    t(`names.${toKey(tag.name)}`, { defaultValue: tag.name });
}
