import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { UserFollowButton } from "@/features/users/components/UserFollowButton";
import { UserList } from "@/features/users/components/UserList";
import { trpc } from "@/router";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createLazyFileRoute("/users/$userId/following")({
  component: UserFollowingPage,
});

function UserFollowingPage() {
  const { userId } = Route.useParams();
  const { t } = useTranslation("users");
  const [{ pages }, followingQuery] =
    trpc.users.following.useSuspenseInfiniteQuery(
      { id: userId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  const totalFollowers = pages[0].followingCount;
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">
        {t("profile.followingHeading", { total: totalFollowers })}
      </h1>
      <InfiniteScroll onLoadMore={followingQuery.fetchNextPage}>
        <UserList
          users={pages.flatMap((page) => page.items)}
          isLoading={
            followingQuery.isFetchingNextPage || followingQuery.isLoading
          }
          rightComponent={(user) => (
            <UserFollowButton
              targetUserId={user.id}
              isFollowing={user.isFollowing}
            />
          )}
        />
      </InfiniteScroll>
    </main>
  );
}
