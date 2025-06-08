import Spinner from "@/features/shared/components/ui/Spinner";
import { useTranslation } from "react-i18next";
import { NotificationForList } from "../types";
import { NotificationCard } from "./NotificationCard";

type NotificationListProps = {
  notifications: NotificationForList[];
  isLoading?: boolean;
};
export function NotificationList({
  notifications,
  isLoading,
}: NotificationListProps) {
  const { t } = useTranslation("notifications");
  return (
    <div className="flex flex-col gap-4">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
      {!isLoading && notifications.length == 0 && (
        <div className="flex justify-center py-4">{t("empty")}</div>
      )}
    </div>
  );
}
