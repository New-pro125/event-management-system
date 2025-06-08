import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog";
import { Experience, User } from "@advanced-react/server/database/schema";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useExperienceMutation } from "../hooks/useExperienceMutation";

type ExperienceKickButtonProps = {
  experienceId: Experience["id"];
  userId: User["id"];
};
export function ExperienceKickButton({
  experienceId,
  userId,
}: ExperienceKickButtonProps) {
  const { t } = useTranslation("experiences");
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useCurrentUser();
  const { kickMutation } = useExperienceMutation({
    kick: {
      onSuccess: () => {
        setIsOpen(false);
      },
    },
  });
  if (!currentUser) return null;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive-link">{t("kick.trigger")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-24px)] sm:w-fit">
        <DialogHeader>
          <DialogTitle>{t("kick.title")}</DialogTitle>
        </DialogHeader>
        <p className="text-neutral-600 dark:text-neutral-400">
          {t("kick.confirm")}
        </p>
        <DialogFooter>
          <Button variant={"outline"} onClick={() => setIsOpen(false)}>
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              kickMutation.mutate({ experienceId, userId });
            }}
            disabled={kickMutation.isPending}
          >
            {kickMutation.isPending ? t("kick.submitting") : t("kick.trigger")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
