import { ExperienceForm } from "@/features/experiences/components/ExperienceForm";
import Card from "@/features/shared/components/ui/Card";
import { router } from "@/router";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/experiences/new")({
  component: CreateExperiencePage,
});

function CreateExperiencePage() {
  const { t } = useTranslation("experiences");
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">{t("pages.create")}</h1>
      <Card>
        <ExperienceForm
          onSuccess={(id) => {
            router.navigate({
              to: "/experiences/$experienceId",
              params: { experienceId: id },
            });
          }}
          onCancel={() => router.history.back()}
        />
      </Card>
    </main>
  );
}
