import { iSTRPCClientError } from "@/router";
import { notFound } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
export const Route = createFileRoute("/users/$userId/")({
  params: {
    parse: (params) => ({
      userId: z.coerce.number().parse(params.userId),
    }),
  },
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await trpcQueryUtils.users.byId.ensureData({
        // It checks if data is in cache
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
