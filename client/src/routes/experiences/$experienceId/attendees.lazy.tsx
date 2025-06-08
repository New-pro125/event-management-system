import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ExperienceKickButton } from "@/features/experiences/components/ExperienceKickButton";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { UserFollowButton } from "@/features/users/components/UserFollowButton";
import { UserList } from "@/features/users/components/UserList";
import { trpc } from "@/router";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute(
  "/experiences/$experienceId/attendees",
)({
  component: AttendeesPage,
});

function AttendeesPage() {
  const { currentUser } = useCurrentUser();
  const { experienceId } = Route.useParams();
  const [experience] = trpc.experiences.byId.useSuspenseQuery({
    id: experienceId,
  });
  const [{ pages }, attendeesQuery] =
    trpc.users.experienceAttendees.useSuspenseInfiniteQuery(
      { experienceId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  const isOwner = currentUser?.id === experience.userId;
  const totalAttendees = pages[0].attendeesCount;
  const { t } = useTranslation("experiences");
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">
        {t("pages.attendeesFor", { title: experience.title })}
      </h1>
      <div className="space-y-2">
        <h2 className="font-medium">
          {t("details.attendees", { total: totalAttendees })}
        </h2>
        <InfiniteScroll
          onLoadMore={attendeesQuery.fetchNextPage}
          // hasNextPage={attendeesQuery.hasNextPage}
        >
          <UserList
            users={pages.flatMap((page) => page.attendees)}
            isLoading={
              attendeesQuery.isFetchingNextPage || attendeesQuery.isLoading
            }
            rightComponent={(user) => (
              <div className="flex items-center gap-4">
                <UserFollowButton
                  targetUserId={user.id}
                  isFollowing={user.isFollowing}
                />
                {isOwner && (
                  <ExperienceKickButton
                    experienceId={experience.id}
                    userId={user.id}
                  />
                )}
              </div>
            )}
          />
        </InfiniteScroll>
      </div>
    </main>
  );
}
