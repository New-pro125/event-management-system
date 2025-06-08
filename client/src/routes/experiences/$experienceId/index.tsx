import { iSTRPCClientError } from "@/router";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
export const Route = createFileRoute("/experiences/$experienceId/")({
  params: {
    parse: (params) => ({
      experienceId: z.coerce.number().parse(params.experienceId),
    }),
  },
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await trpcQueryUtils.experiences.byId.ensureData({
        // It checks if data is in cache
        id: params.experienceId,
      });
    } catch (error) {
      if (iSTRPCClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
});
