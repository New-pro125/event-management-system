import { ExperienceForm } from "@/features/experiences/components/ExperienceForm";
import Card from "@/features/shared/components/ui/Card";
import { iSTRPCClientError, router, trpc } from "@/router";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/experiences/$experienceId/edit")({
  component: EditPage,

  loader: async ({ params, context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();
    try {
      const experience = await trpcQueryUtils.experiences.byId.ensureData({
        id: Number(params.experienceId),
      });
      if (!currentUser || currentUser.id !== experience.userId) {
        throw redirect({
          to: "/experiences/$experienceId",
          params: { experienceId: Number(params.experienceId) },
        });
      }
    } catch (error) {
      if (iSTRPCClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
});

function EditPage() {
  const { experienceId } = Route.useParams();
  const [experience] = trpc.experiences.byId.useSuspenseQuery({
    id: Number(experienceId),
  });
  const { t } = useTranslation("experiences");
  function navigateToExperience() {
    router.navigate({
      to: "/experiences/$experienceId",
      params: { experienceId: Number(experienceId) },
    });
  }
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">{t("pages.edit")}</h1>
      <Card>
        <ExperienceForm
          experience={experience}
          onSuccess={navigateToExperience}
          onCancel={navigateToExperience}
        />
      </Card>
    </main>
  );
}
