import { CommentForList, CommentOptimistic } from "../types";
import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog";
import { trpc } from "@/router";
import { useToast } from "@/features/shared/hooks/useToast";
import { useState } from "react";

type commentDeleteProps = {
  comment: CommentForList;
};

export default function CommentDelete({ comment }: commentDeleteProps) {
  const { toast } = useToast();
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
        title: "Comment deleted ",
        description: "Comment deleted successfully",
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
        title: "Failed to delete comment",
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
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Comment</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete this comment? This action cannot be
          undone.
        </p>
        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              setIsDeleteDialogOpen(false);
            }}
          >
            Cancel
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
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
