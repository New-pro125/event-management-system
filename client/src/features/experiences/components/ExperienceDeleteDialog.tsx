import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/shared/components/ui/Dialog";
import { Experience } from "@advanced-react/server/database/schema";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useExperienceMutation } from "../hooks/useExperienceMutation";

type ExperienceDeleteDialogProps = {
  experience: Experience;
  onSuccess?: (id: Experience["id"]) => void;
};

export function ExperienceDeleteDialog({
  experience,
  onSuccess,
}: ExperienceDeleteDialogProps) {
  const { t } = useTranslation("experiences");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { deleteMutation } = useExperienceMutation({
    delete: {
      onSuccess: (id) => {
        setIsOpen(false);
        onSuccess?.(id);
      },
    },
  });
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive-link">{t("common:actions.delete")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-24px)] sm:w-fit">
        <DialogHeader>
          <DialogTitle>{t("delete.title")}</DialogTitle>
        </DialogHeader>
        <p className="text-neutral-600 dark:text-neutral-400">
          {t("delete.confirm")}
        </p>
        <DialogFooter>
          <Button variant={"outline"} onClick={() => setIsOpen(false)}>
            t("common:actions.cancel")
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deleteMutation.mutate({ id: experience.id });
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending
              ? t("common:actions.deleting")
              : t("common:actions.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
