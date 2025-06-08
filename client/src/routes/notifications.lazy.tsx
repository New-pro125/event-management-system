import { NotificationList } from "@/features/notifications/components/NotificationList";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { trpc } from "@/router";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const [{ pages }, notificationQuery] =
    trpc.notifications.feed.useSuspenseInfiniteQuery(
      {},
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );
  return (
    <main className="flex flex-col gap-4">
      <InfiniteScroll onLoadMore={notificationQuery.fetchNextPage}>
        <NotificationList
          notifications={pages.flatMap((page) => page.notifications)}
          isLoading={
            notificationQuery.isFetchingNextPage || notificationQuery.isLoading
          }
        />
      </InfiniteScroll>
    </main>
  );
}
