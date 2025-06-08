import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "./ui/Card";
export function NotFoundComponent() {
  const { t } = useTranslation("common");
  return (
    <Card className="flex flex-col items-center justify-center gap-2">
      <AlertCircle className="h-8 w-8" />
      <p>{t("errors.notFound")}</p>
    </Card>
  );
}
