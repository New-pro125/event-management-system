import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ExperienceKickButton } from "@/features/experiences/components/ExperienceKickButton";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { UserFollowButton } from "@/features/users/components/UserFollowButton";
import { UserList } from "@/features/users/components/UserList";
import { iSTRPCClientError, trpc } from "@/router";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/experiences/$experienceId/attendees")({
  component: AttendeesPage,
  params: {
    parse: (params) => ({
      experienceId: z.coerce.number().parse(params.experienceId),
    }),
  },
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await Promise.all([
        trpcQueryUtils.experiences.byId.ensureData({
          id: params.experienceId,
        }),
        trpcQueryUtils.users.experienceAttendees.prefetchInfinite({
          experienceId: params.experienceId,
        }),
      ]);
    } catch (error) {
      if (iSTRPCClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
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
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Attendees for "{experience.title}"</h1>
      <div className="space-y-2">
        <h2 className="font-medium">Attendees ({totalAttendees})</h2>
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
