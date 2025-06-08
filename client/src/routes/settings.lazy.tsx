import { ChangeEmailDialog } from "@/features/auth/components/ChangeEmailDialog";
import { ChangePasswordDialog } from "@/features/auth/components/ChangePasswordDialog";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import { useToast } from "@/features/shared/hooks/useToast";
import { router, trpc } from "@/router";
import { createLazyFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";
export const Route = createLazyFileRoute("/settings")({
  component: SettingsPage,
});

type SettingsAttributes = {
  label: string;
  component: React.ReactNode;
};
function SettingsPage() {
  const { currentUser } = useCurrentUser();
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { t } = useTranslation("auth");

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();
      await utils.notifications.unreadCount.reset();
      await utils.notifications.feed.reset();
      router.navigate({ to: "/login" });
      toast({
        title: t("settings.toast.loggedOutTitle"),
        description: t("settings.toast.loggedOutDescription"),
      });
    },
    onError: (err) => {
      toast({
        title: t("settings.toast.logoutFailed"),
        description: err.message,
        variant: "destructive",
      });
    },
  });
  const settings: SettingsAttributes[] = [
    { label: currentUser?.email as string, component: <ChangeEmailDialog /> },
    {
      label: t("settings.changePassword"),
      component: <ChangePasswordDialog />,
    },
    {
      label: t("settings.signOut"),
      component: (
        <Button
          variant="destructive"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          {logoutMutation.isPending
            ? t("settings.loggingOut")
            : t("settings.logOut")}
        </Button>
      ),
    },
  ];
  return (
    <main>
      {settings.map((setting) => (
        <Card className="mb-2 flex w-full items-center justify-between">
          <span className="text-neutral-600 dark:text-neutral-400">
            {setting.label}
          </span>
          {setting.component}
        </Card>
      ))}
    </main>
  );
}
