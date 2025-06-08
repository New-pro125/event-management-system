import { ExperienceList } from "@/features/experiences/components/ExperienceList";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { useTagLabel } from "@/features/tags/hooks/useTagLabel";
import { iSTRPCClientError, trpc } from "@/router";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";
export const Route = createFileRoute("/tags/$tagId")({
  params: {
    parse: (params) => ({
      tagId: z.coerce.number().parse(params.tagId),
    }),
  },
  component: TagPage,
  loader: async ({ params: { tagId }, context: { trpcQueryUtils } }) => {
    try {
      await Promise.all([
        trpcQueryUtils.tags.byId.ensureData({ id: tagId }),
        trpcQueryUtils.experiences.byTagId.prefetchInfinite({
          id: tagId,
        }),
      ]);
    } catch (error) {
      if (iSTRPCClientError(error) && error.data?.code == "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
});

function TagPage() {
  const { tagId } = Route.useParams();
  const [tag] = trpc.tags.byId.useSuspenseQuery({ id: tagId });
  const [{ pages }, tagsQuery] =
    trpc.experiences.byTagId.useSuspenseInfiniteQuery(
      {
        id: tagId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  const getTagLabel = useTagLabel();
  const { t } = useTranslation("tags");
  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-bold">
        {t("page.heading", { tag: getTagLabel(tag) })}
      </h2>
      <InfiniteScroll onLoadMore={tagsQuery.fetchNextPage}>
        <ExperienceList
          experiences={pages.flatMap((page) => page.experiences)}
          isLoading={tagsQuery.isFetchingNextPage || tagsQuery.isLoading}
        />
      </InfiniteScroll>
    </main>
  );
}
