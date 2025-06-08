import { CommentsSection } from "@/features/comments/components/CommentsSection";
import { ExperienceDetails } from "@/features/experiences/components/ExperienceDetails";
import { ExperienceForDetails } from "@/features/experiences/types";
import { trpc } from "@/router";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/experiences/$experienceId/")({
  component: ExperiencePage,
});

function ExperiencePage() {
  const { experienceId } = Route.useParams();
  const [experience] = trpc.experiences.byId.useSuspenseQuery({
    id: experienceId,
  });
  return (
    <main className="space-y-4 pb-20">
      <ExperienceDetails
        experience={experience as unknown as ExperienceForDetails}
      />
      <CommentsSection
        experienceId={experienceId}
        commentsCount={experience.commentsCount}
      />
    </main>
  );
}
