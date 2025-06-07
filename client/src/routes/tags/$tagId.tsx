import { iSTRPCClientError } from "@/router";
import { createFileRoute, notFound } from "@tanstack/react-router";
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
  return <div>Hello "/tags/$tagId"!</div>;
}
