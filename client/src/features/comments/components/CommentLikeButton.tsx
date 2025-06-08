import { Button } from "@/features/shared/components/ui/Button";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";
import { Comment } from "@advanced-react/server/database/schema";
import { useParams } from "@tanstack/react-router";
import { Heart } from "lucide-react";

type CommentLikeButtonProps = {
  commentId: Comment["id"];
  isLiked: boolean;
  likesCount: number;
  disabled?: boolean;
};

export function CommentLikeButton({
  commentId,
  isLiked,
  likesCount,
  disabled,
}: CommentLikeButtonProps) {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const { experienceId } = useParams({ strict: false });
  const likeMutation = trpc.comments.like.useMutation({
    onMutate: async ({ id }) => {
      if (!experienceId) return;
      await utils.comments.byExperienceId.cancel({
        experienceId: experienceId as number,
      });
      const previousData = {
        byExperienceId: utils.comments.byExperienceId.getData({
          experienceId: experienceId as number,
        }),
      };
      utils.comments.byExperienceId.setData(
        { experienceId: experienceId as number },
        (oldData) => {
          if (!oldData) return;
          return oldData.map((comment) =>
            comment.id === id
              ? {
                  ...comment,
                  isLiked: true,
                  likesCount: comment.likesCount + 1,
                }
              : comment,
          );
        },
      );
      return { previousData };
    },
    onError: (error, { id }, context) => {
      utils.comments.byExperienceId.setData(
        { experienceId: id as number },
        context?.previousData.byExperienceId,
      );
      toast({
        title: "Like Comment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const unlikeMutation = trpc.comments.unlike.useMutation({
    onMutate: async ({ id }) => {
      if (!experienceId) return;
      await utils.comments.byExperienceId.cancel({
        experienceId: experienceId as number,
      });
      const previousData = {
        byExperienceId: utils.comments.byExperienceId.getData({
          experienceId: experienceId as number,
        }),
      };
      utils.comments.byExperienceId.setData(
        { experienceId: experienceId as number },
        (oldData) => {
          if (!oldData) return;
          return oldData.map((comment) =>
            comment.id === id
              ? {
                  ...comment,
                  isLiked: false,
                  likesCount: Math.max(0, comment.likesCount - 1),
                }
              : comment,
          );
        },
      );
      return { previousData };
    },
    onError: (error, { id }, context) => {
      utils.comments.byExperienceId.setData(
        { experienceId: id as number },
        context?.previousData.byExperienceId,
      );
      toast({
        title: "Like Comment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  return (
    <Button
      variant={"link"}
      onClick={() =>
        isLiked
          ? unlikeMutation.mutate({ id: commentId })
          : likeMutation.mutate({ id: commentId })
      }
      disabled={likeMutation.isPending || unlikeMutation.isPending || disabled}
    >
      <Heart
        className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
      />
      {likesCount}
    </Button>
  );
}
