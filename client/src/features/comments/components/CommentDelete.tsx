import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CommentForList, CommentOptimistic } from "../types";

type commentDeleteProps = {
  comment: CommentForList;
};

export default function CommentDelete({ comment }: commentDeleteProps) {
  const { toast } = useToast();
  const { t } = useTranslation("comments");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const utils = trpc.useUtils();
  const deleteMutation = trpc.comments.delete.useMutation({
    onMutate: async ({ id }) => {
      setIsDeleteDialogOpen(false);
      await Promise.all([
        utils.comments.byExperienceId.cancel({
          experienceId: comment.experienceId,
        }),
        utils.experiences.byId.cancel({
          id: comment.experienceId,
        }),
      ]);
      const previousData = {
        byExperienceId: utils.comments.byExperienceId.getData({
          experienceId: comment.experienceId,
        }),
        experienceById: utils.experiences.byId.getData({
          id: comment.experienceId,
        }),
      };
      utils.comments.byExperienceId.setData(
        { experienceId: comment.experienceId },
        (oldData) => {
          if (!oldData) return;
          return oldData.filter((comment) => comment.id !== id);
        },
      );
      utils.experiences.byId.setData({ id: comment.id }, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          commentsCount: Math.max(oldData.commentsCount - 1, 0),
        };
      });
      const { dismiss } = toast({
        title: t("toast.deleted.title"),
        description: t("toast.deleted.description"),
      });
      return { dismiss, previousData };
    },
    onError: (error, _, context) => {
      context?.dismiss?.();
      utils.experiences.byId.setData(
        { id: comment.id },
        context?.previousData.experienceById,
      );
      utils.comments.byExperienceId.setData(
        { experienceId: comment.experienceId },
        context?.previousData.byExperienceId,
      );
      toast({
        title: t("toast.deleteFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive-link"
          disabled={(comment as CommentOptimistic).optimistic}
        >
          {t("common:actions.delete")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-24px)] sm:w-fit">
        <DialogHeader>
          <DialogTitle>{t("delete.title")}</DialogTitle>
        </DialogHeader>
        <p>{t("delete.confirm")}</p>
        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              setIsDeleteDialogOpen(false);
            }}
          >
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deleteMutation.mutate({
                id: comment.id,
              });
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
