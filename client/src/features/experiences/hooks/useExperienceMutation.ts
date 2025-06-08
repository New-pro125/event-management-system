import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";
import { Experience, User } from "@advanced-react/server/database/schema";
import { useParams, useSearch } from "@tanstack/react-router";
type ExperienceMutationsOptions = {
  add?: {
    onSuccess?: (id: Experience["id"]) => void;
  };
  edit?: {
    onSuccess?: (id: Experience["id"]) => void;
  };
  delete?: {
    onSuccess?: (id: Experience["id"]) => void;
  };
  kick?: {
    onSuccess?: (id: Experience["id"]) => void;
  };
};
export function useExperienceMutation(
  options: ExperienceMutationsOptions = {},
) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { userId: pathUserId } = useParams({ strict: false });
  const { tagId: pathTagId } = useParams({ strict: false });
  const { q: pathQ } = useSearch({ strict: false });
  const { tags: pathTags } = useSearch({ strict: false });
  const { scheduledAt: pathScheduledAt } = useSearch({ strict: false });
  const currentUser = useCurrentUser();
  const addMutation = trpc.experiences.add.useMutation({
    onSuccess: ({ id }) => {
      toast({
        title: "Experience created",
        description: "Your experience has been created",
      });
      options.add?.onSuccess?.(id);
    },
    onError: (error) => {
      toast({
        title: "Failed to create experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const editMutation = trpc.experiences.edit.useMutation({
    onSuccess: async ({ id }) => {
      await Promise.all([
        utils.experiences.byId.invalidate({ id }),
        utils.experiences.favorites.invalidate(),
      ]);

      toast({
        title: "Experience updated",
        description: "Your experience has been updated successfully!",
      });
      options.edit?.onSuccess?.(id);
    },
    onError: (error) => {
      toast({
        title: "Failed to edit experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const deleteMutation = trpc.experiences.delete.useMutation({
    onSuccess: async (id) => {
      await Promise.all([
        utils.experiences.feed.invalidate(),
        utils.experiences.favorites.invalidate(),
        ...(pathUserId
          ? [utils.experiences.byUserId.invalidate({ id: pathUserId })]
          : []),
        ...(pathQ || pathTags || pathScheduledAt
          ? [
              utils.experiences.search.invalidate({
                q: pathQ,
                tags: pathTags,
                scheduledAt: pathScheduledAt,
              }),
            ]
          : []),
        ...(pathTagId
          ? [utils.experiences.byTagId.invalidate({ id: pathTagId })]
          : []),
      ]);

      toast({
        title: "Experience deletion done!",
        description: "Experience deletion has done successfully!",
      });
      options.delete?.onSuccess?.(id);
    },
    onError: (error) => {
      toast({
        title: "Experience deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const attendMutation = trpc.experiences.attend.useMutation({
    onMutate: async ({ id }) => {
      // Optimistic Update
      function updateExperience<
        T extends {
          isAttending: boolean;
          attendeesCount: number;
          attendees?: User[];
        },
      >(oldData: T) {
        return {
          ...oldData,
          isAttending: true,
          attendeesCount: oldData.attendeesCount + 1,
          ...(oldData.attendees && {
            attendees: [currentUser, ...oldData.attendees],
          }),
        };
      }
      await Promise.all([
        utils.experiences.byId.cancel({ id }),
        utils.experiences.feed.cancel(),
        ...(pathUserId
          ? [utils.experiences.byUserId.cancel({ id: pathUserId })]
          : []),
        ...(pathQ || pathTags || pathScheduledAt
          ? [
              utils.experiences.search.cancel({
                q: pathQ,
                tags: pathTags,
                scheduledAt: pathScheduledAt,
              }),
            ]
          : []),
        utils.experiences.favorites.cancel(),
        ...(pathTagId
          ? [utils.experiences.byTagId.cancel({ id: pathTagId })]
          : []),
      ]);
      const previousData = {
        byId: utils.experiences.byId.getData({ id }),
        feed: utils.experiences.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        search:
          pathQ || pathTags || pathScheduledAt
            ? utils.experiences.search.getInfiniteData({
                q: pathQ,
                tags: pathTags,
                scheduledAt: pathScheduledAt,
              })
            : undefined,
        favorites: utils.experiences.favorites.getInfiniteData(),
        byTagId: pathTagId
          ? utils.experiences.byTagId.getInfiniteData({ id: pathTagId })
          : undefined,
      };
      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) return;
        return updateExperience(oldData);
      });
      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });
      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }
      if (pathQ || pathTags || pathScheduledAt) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags, scheduledAt: pathScheduledAt },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }
      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }
      utils.experiences.favorites.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });
      return { previousData };
    },
    onError: (error, { id }, context) => {
      utils.experiences.favorites.setInfiniteData(
        {},
        context?.previousData.favorites,
      );
      utils.experiences.byId.setData({ id }, context?.previousData.byId);
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);
      if (pathUserId)
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      if (pathQ || pathTags || pathScheduledAt)
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags, scheduledAt: pathScheduledAt },
          context?.previousData.search,
        );
      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          context?.previousData.byTagId,
        );
      }
      toast({
        title: "Failed to attend experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const unattendMutation = trpc.experiences.unattend.useMutation({
    onMutate: async ({ id }) => {
      // Optimistic Update
      function updateExperience<
        T extends {
          isAttending: boolean;
          attendeesCount: number;
          attendees?: User[];
        },
      >(oldData: T) {
        return {
          ...oldData,
          isAttending: false,
          attendeesCount: Math.max(0, oldData.attendeesCount - 1),
          ...(oldData.attendees && {
            attendees: oldData.attendees?.filter(
              (user) => user.id !== currentUser?.id,
            ),
          }),
        };
      }
      await Promise.all([
        utils.experiences.byId.cancel({ id }),
        utils.experiences.feed.cancel(),
        utils.experiences.favorites.cancel(),
        ...(pathUserId
          ? [utils.experiences.byUserId.cancel({ id: pathUserId })]
          : []),
        ...(pathQ || pathTags || pathScheduledAt
          ? [
              utils.experiences.search.cancel({
                q: pathQ,
                tags: pathTags,
                scheduledAt: pathScheduledAt,
              }),
            ]
          : []),
        ...(pathTagId
          ? [utils.experiences.byTagId.cancel({ id: pathTagId })]
          : []),
      ]);
      const previousData = {
        byId: utils.experiences.byId.getData({ id }),
        feed: utils.experiences.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        search:
          pathQ || pathTags || pathScheduledAt
            ? utils.experiences.search.getInfiniteData({
                q: pathQ,
                tags: pathTags,
                scheduledAt: pathScheduledAt,
              })
            : undefined,
        favorites: utils.experiences.favorites.getInfiniteData(),
        byTagId: pathTagId
          ? utils.experiences.byTagId.getInfiniteData()
          : undefined,
      };
      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) return;
        return updateExperience(oldData);
      });
      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });
      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }
      if (pathQ || pathTags || pathScheduledAt) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags, scheduledAt: pathScheduledAt },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }
      utils.experiences.favorites.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });
      return { previousData };
    },
    onError: (error, { id }, context) => {
      utils.experiences.favorites.setInfiniteData(
        {},
        context?.previousData.favorites,
      );
      utils.experiences.byId.setData({ id }, context?.previousData.byId);
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);
      if (pathUserId)
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      if (pathQ || pathTags || pathScheduledAt)
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags, scheduledAt: pathScheduledAt },
          context?.previousData.search,
        );
      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          context?.previousData.byTagId,
        );
      }
      toast({
        title: "Failed to attend experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const favoriteMutation = trpc.experiences.favorite.useMutation({
    onMutate: async ({ id }) => {
      function updateExperience<
        T extends { isFavorited: boolean; favoritesCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFavorited: true,
          favoritesCount: oldData.favoritesCount + 1,
        };
      }
      await Promise.all([
        utils.experiences.byId.cancel({ id }),
        utils.experiences.feed.cancel({}),
        utils.experiences.favorites.cancel(),
        (pathQ || pathTags || pathScheduledAt) &&
          utils.experiences.search.cancel({
            q: pathQ,
            tags: pathTags,
            scheduledAt: pathScheduledAt,
          }),
        pathUserId && utils.experiences.byUserId.cancel({ id: pathUserId }),
        pathTagId && utils.experiences.byTagId.cancel({ id: pathTagId }),
      ]);
      const previousData = {
        byId: utils.experiences.byId.getData({ id }),
        feed: utils.experiences.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        search:
          pathQ || pathTags || pathScheduledAt
            ? utils.experiences.search.getInfiniteData({
                q: pathQ,
                tags: pathTags,
                scheduledAt: pathScheduledAt,
              })
            : undefined,
        favorites: utils.experiences.favorites.getInfiniteData(),
        byTagId: pathTagId
          ? utils.experiences.byTagId.getInfiniteData()
          : undefined,
      };
      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) return;
        return updateExperience(oldData);
      });
      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });
      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }
      if (pathQ || pathTags || pathScheduledAt) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags, scheduledAt: pathScheduledAt },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }
      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      utils.experiences.favorites.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });
      return { previousData };
    },
    onError: (error, { id }, context) => {
      utils.experiences.favorites.setInfiniteData(
        {},
        context?.previousData.favorites,
      );
      utils.experiences.byId.setData({ id }, context?.previousData.byId);
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);
      if (pathUserId)
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      if (pathQ || pathTags || pathScheduledAt)
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags, scheduledAt: pathScheduledAt },
          context?.previousData.search,
        );
      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          context?.previousData.byTagId,
        );
      }
      toast({
        title: "Failed to favorite experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const unfavoriteMutation = trpc.experiences.unfavorite.useMutation({
    onMutate: async ({ id }) => {
      function updateExperience<
        T extends { isFavorited: boolean; favoritesCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFavorited: false,
          favoritesCount: Math.max(0, oldData.favoritesCount - 1),
        };
      }
      await Promise.all([
        utils.experiences.byId.cancel({ id }),
        utils.experiences.feed.cancel({}),
        utils.experiences.favorites.cancel(),
        (pathQ || pathTags || pathScheduledAt) &&
          utils.experiences.search.cancel({
            q: pathQ,
            tags: pathTags,
            scheduledAt: pathScheduledAt,
          }),
        pathUserId && utils.experiences.byUserId.cancel({ id: pathUserId }),
        pathTagId && utils.experiences.byTagId.cancel({ id: pathTagId }),
      ]);
      const previousData = {
        byId: utils.experiences.byId.getData({ id }),
        feed: utils.experiences.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        search:
          pathQ || pathTags || pathScheduledAt
            ? utils.experiences.search.getInfiniteData({
                q: pathQ,
                tags: pathTags,
                scheduledAt: pathScheduledAt,
              })
            : undefined,
        favorites: utils.experiences.favorites.getInfiniteData(),
        byTagId: pathTagId
          ? utils.experiences.byTagId.getInfiniteData()
          : undefined,
      };
      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) return;
        return updateExperience(oldData);
      });
      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });
      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }
      if (pathQ || pathTags || pathScheduledAt) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags, scheduledAt: pathScheduledAt },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }
      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          (oldData) => {
            if (!oldData) return;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }
      utils.experiences.favorites.setInfiniteData({}, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.filter((e) => e.id !== id),
          })),
        };
      });
      return { previousData };
    },
    onError: (error, { id }, context) => {
      utils.experiences.byId.setData({ id }, context?.previousData.byId);
      utils.experiences.favorites.setInfiniteData(
        {},
        context?.previousData.favorites,
      );
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);
      if (pathUserId)
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      if (pathQ || pathTags || pathScheduledAt)
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags, scheduledAt: pathScheduledAt },
          context?.previousData.search,
        );
      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          context?.previousData.byTagId,
        );
      }
      toast({
        title: "Failed to unfavorite experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const kickMutation = trpc.experiences.kickAttendee.useMutation({
    onMutate: async ({ experienceId, userId }) => {
      await utils.users.experienceAttendees.cancel({ experienceId });
      const previousData = {
        byId: utils.users.experienceAttendees.getInfiniteData({
          experienceId,
        }),
      };
      utils.users.experienceAttendees.setInfiniteData(
        { experienceId },
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              attendees: page.attendees.filter((e) => e.id !== experienceId),
              attendeesCount: Math.max(0, page.attendeesCount - 1),
            })),
          };
        },
      );
      toast({
        title: "Attendee kicked",
        description: "The attendee has been kicked from the experience",
      });
      return { previousData };
    },
    onSuccess: (_, { experienceId }) => {
      options.kick?.onSuccess?.(experienceId);
    },
    onError: (error, { experienceId }, context) => {
      utils.users.experienceAttendees.setInfiniteData(
        { experienceId },
        context?.previousData.byId,
      );
      toast({
        title: "Failed to kick attendee",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  return {
    addMutation,
    editMutation,
    deleteMutation,
    attendMutation,
    unattendMutation,
    favoriteMutation,
    unfavoriteMutation,
    kickMutation,
  };
}
