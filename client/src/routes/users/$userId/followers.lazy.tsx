import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { UserFollowButton } from "@/features/users/components/UserFollowButton";
import { UserList } from "@/features/users/components/UserList";
import { trpc } from "@/router";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
export const Route = createLazyFileRoute("/users/$userId/followers")({
  component: UserFollowersPage,
});

function UserFollowersPage() {
  const { t } = useTranslation("users");
  const { userId } = Route.useParams();
  const [{ pages }, followersQuery] =
    trpc.users.followers.useSuspenseInfiniteQuery(
      { id: userId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  const totalFollowers = pages[0].followersCount;
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">
        {t("profile.followersHeading", { total: totalFollowers })}
      </h1>
      <InfiniteScroll onLoadMore={followersQuery.fetchNextPage}>
        <UserList
          users={pages.flatMap((page) => page.items)}
          isLoading={
            followersQuery.isFetchingNextPage || followersQuery.isLoading
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
