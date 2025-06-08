import { LinkProps } from "@tanstack/react-router";
import { NotificationForList } from "../types";
import Link from "@/features/shared/components/ui/Link";
import Card from "@/features/shared/components/ui/Card";
import { format } from "date-fns/format";
import { trpc } from "@/router";
import { useToast } from "@/features/shared/hooks/useToast";

type NotificationCardProps = {
  notification: NotificationForList;
};
export function NotificationCard({ notification }: NotificationCardProps) {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  let linkProps: Pick<LinkProps, "to" | "params"> | undefined;
  if (
    [
      "user_commented_experience",
      "user_attending_experience",
      "user_unattending_experience",
    ].includes(notification.type) &&
    notification.experienceId
  ) {
    linkProps = {
      to: "/experiences/$experienceId",
      params: { experienceId: notification.experienceId },
    };
  } else if (notification.type === "user_followed_user") {
    linkProps = {
      to: "/users/$userId",
      params: { userId: notification.fromUserId },
    };
  }
  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onMutate: async ({ id }) => {
      await Promise.all([
        utils.notifications.feed.cancel(),
        utils.notifications.unreadCount.cancel(),
      ]);
      const previousData = {
        feed: utils.notifications.feed.getInfiniteData({}),
        unreadCount: utils.notifications.unreadCount.getData(),
      };
      utils.notifications.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return undefined;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((notification) =>
              notification.id === id
                ? { ...notification, read: true }
                : notification,
            ),
          })),
        };
      });
      utils.notifications.unreadCount.setData(undefined, (oldUnreadCount) => {
        if (!oldUnreadCount) return;
        return Math.max(oldUnreadCount - 1, 0);
      });
      return { previousData };
    },
    onError: (error, _, context) => {
      utils.notifications.feed.setInfiniteData({}, context?.previousData.feed);
      utils.notifications.unreadCount.setData(
        undefined,
        context?.previousData.unreadCount,
      );
      toast({
        title: "Marking notification as read failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  return (
    <Link
      {...linkProps}
      variant="ghost"
      onClick={() =>
        !notification.read && markAsRead.mutate({ id: notification.id })
      }
    >
      <Card className="flex w-full items-center justify-between gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800">
        <div>
          <p className="text-gray-800 dark:text-gray-200">
            {notification.content}
          </p>
          <p className="text-sm text-gray-500">
            {format(new Date(notification.createdAt), "PPp")}
          </p>
        </div>
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-red-500" />
        )}
      </Card>
    </Link>
  );
}
