import { ExperienceList } from "@/features/experiences/components/ExperienceList";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { trpc } from "@/router";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  loader: async ({ context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();
    if (!currentUser) return redirect({ to: "/login" });
    await trpcQueryUtils.experiences.favorites.prefetchInfinite({});
  },
});

function FavoritesPage() {
  const [{ pages }, favoritesQuery] =
    trpc.experiences.favorites.useSuspenseInfiniteQuery(
      {},
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );
  return (
    <main className="flex flex-col gap-4">
      <InfiniteScroll onLoadMore={favoritesQuery.fetchNextPage}>
        <ExperienceList
          experiences={pages.flatMap((page) => page.experiences)}
          isLoading={
            favoritesQuery.isFetchingNextPage || favoritesQuery.isLoading
          }
        />
      </InfiniteScroll>
    </main>
  );
}
