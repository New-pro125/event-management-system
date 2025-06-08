import { ChangeEmailDialog } from "@/features/auth/components/ChangeEmailDialog";
import { ChangePasswordDialog } from "@/features/auth/components/ChangePasswordDialog";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import { useToast } from "@/features/shared/hooks/useToast";
import { router, trpc } from "@/router";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  loader: async ({ context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();
    if (!currentUser) {
      return redirect({ to: "/login" });
    }
  },
});
type SettingsAttributes = {
  label: string;
  component: React.ReactNode;
};
function SettingsPage() {
  const { currentUser } = useCurrentUser();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();
      await utils.notifications.unreadCount.reset();
      await utils.notifications.feed.reset();
      router.navigate({ to: "/login" });
      toast({
        title: "Logged out",
        description: "You have been logged out",
      });
    },
    onError: (err) => {
      toast({
        title: "Logging out failed!",
        description: err.message,
        variant: "destructive",
      });
    },
  });
  const settings: SettingsAttributes[] = [
    { label: currentUser?.email as string, component: <ChangeEmailDialog /> },
    { label: "Change Password", component: <ChangePasswordDialog /> },
    {
      label: "Sign out of your account",
      component: (
        <Button
          variant="destructive"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          {logoutMutation.isPending ? "Logging out..." : "Log out"}
        </Button>
      ),
    },
  ];
  return (
    <main>
      {settings.map((setting) => (
        <Card className="mb-2 flex items-center justify-between">
          <span className="text-neutral-600 dark:text-neutral-400">
            {setting.label}
          </span>
          {setting.component}
        </Card>
      ))}
    </main>
  );
}
