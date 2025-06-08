import Card from "@/features/shared/components/ui/Card";
import { CommentForList, CommentOptimistic } from "../types";
import { useState } from "react";
import CommentEditForm from "./CommentEditForm";
import { Button } from "@/features/shared/components/ui/Button";
import CommentDelete from "./CommentDelete";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import Link from "@/features/shared/components/ui/Link";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { CommentLikeButton } from "./CommentLikeButton";

type CommentCardProps = {
  comment: CommentForList;
};

export function CommentCard({ comment }: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  if (isEditing) {
    return <CommentEditForm comment={comment} setIsEditing={setIsEditing} />;
  }
  return (
    <Card className="space-y-4">
      <CommentCardHeader comment={comment} />
      <CommentCardContent comment={comment} />
      <CommentCardMetricButton comment={comment} />
      <CommentCardButtons setIsEditing={setIsEditing} comment={comment} />
    </Card>
  );
}

type CommentCardHeaderProps = Pick<CommentCardProps, "comment">;
function CommentCardHeader({ comment }: CommentCardHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/users/$userId"
        params={{ userId: comment.user.id }}
        variant="ghost"
      >
        <UserAvatar user={comment.user} />
      </Link>
      <time className="text-sm text-neutral-500">
        {new Date(comment.createdAt).toLocaleString()}
      </time>
    </div>
  );
}

type CommentCardContentProps = Pick<CommentCardProps, "comment">;
function CommentCardContent({ comment }: CommentCardContentProps) {
  return <p>{comment.content}</p>;
}

type CommentCardButtonsProps = {
  setIsEditing: (value: boolean) => void;
} & Pick<CommentCardProps, "comment">;
function CommentCardButtons({
  setIsEditing,
  comment,
}: CommentCardButtonsProps) {
  const { currentUser } = useCurrentUser();
  const isCommentOwner = currentUser?.id === comment.userId;
  const isExperienceOwner = currentUser?.id === comment.experience.userId;
  return (
    <div className="flex gap-4">
      {isCommentOwner && (
        <Button
          variant="link"
          onClick={() => setIsEditing(true)}
          disabled={(comment as CommentOptimistic).optimistic}
        >
          Edit
        </Button>
      )}
      {(isCommentOwner || isExperienceOwner) && (
        <CommentDelete comment={comment} />
      )}
    </div>
  );
}
type CommentCardMetricButtonProps = Pick<CommentCardProps, "comment">;

function CommentCardMetricButton({ comment }: CommentCardMetricButtonProps) {
  return (
    <CommentLikeButton
      commentId={comment.id}
      isLiked={comment.isLiked}
      likesCount={comment.likesCount}
      disabled={(comment as CommentOptimistic).optimistic}
    />
  );
}
