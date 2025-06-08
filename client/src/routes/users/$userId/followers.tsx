import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { iSTRPCClientError } from "@/router";
import { notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/users/$userId/followers")({
  params: {
    parse: (params) => ({
      userId: z.coerce.number().parse(params.userId),
    }),
  },
  loader: async ({ context: { trpcQueryUtils }, params }) => {
    try {
      await trpcQueryUtils.users.followers.prefetchInfinite({
        id: params.userId,
      });
    } catch (error) {
      if (iSTRPCClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
});
