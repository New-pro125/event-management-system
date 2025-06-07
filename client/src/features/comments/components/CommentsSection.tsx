import { trpc } from "@/router";
import { Experience } from "@advanced-react/server/database/schema";
import CommentList from "./CommentsList";
import { CommentCreateForm } from "./CommentCreateForm";
import { ErrorComponent } from "@/features/shared/components/ErrorComponent";
import Card from "@/features/shared/components/ui/Card";
import Spinner from "@/features/shared/components/ui/Spinner";
type CommentsSectionProps = {
  experienceId: Experience["id"];
  commentsCount: number;
};

export function CommentsSection({
  commentsCount,
  experienceId,
}: CommentsSectionProps) {
  const commentsQuery = trpc.comments.byExperienceId.useQuery({ experienceId });
  const experienceQuery = trpc.experiences.byId.useQuery({ id: experienceId });
  if (commentsQuery.error || experienceQuery.error) return <ErrorComponent />;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Comments ({commentsCount})</h3>
      {commentsQuery.isPending || experienceQuery.isPending ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : (
        <>
          <Card>
            <CommentCreateForm experience={experienceQuery.data} />
          </Card>
          <CommentList comments={commentsQuery.data} />
        </>
      )}
    </div>
  );
}
