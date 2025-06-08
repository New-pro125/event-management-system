import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/notifications")({
  loader: async ({ context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();
    if (!currentUser) return redirect({ to: "/login" });
    await trpcQueryUtils.notifications.feed.prefetchInfinite({});
  },
});
