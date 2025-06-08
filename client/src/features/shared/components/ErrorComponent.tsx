import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/Button";
import Card from "./ui/Card";

export function ErrorComponent() {
  const router = useRouter();
  const { t } = useTranslation("common");
  return (
    <Card className="flex flex-col items-center justify-center gap-2">
      <AlertTriangle className="h-8 w-8" />
      <p>{t("errors.generic")}</p>
      <Button variant="ghost" onClick={() => router.invalidate()}>
        <RefreshCcw className="h-4 w-4" />
        {t("errors.tryAgain")}
      </Button>
    </Card>
  );
}
