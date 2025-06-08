import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import Link from "@/features/shared/components/ui/Link";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { useFormatters } from "@/lib/i18n/useFormatters";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CommentForList, CommentOptimistic } from "../types";
import CommentDelete from "./CommentDelete";
import CommentEditForm from "./CommentEditForm";
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
  const { formatDateTime } = useFormatters();
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
        {formatDateTime(comment.createdAt)}
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
  const { t } = useTranslation("common");
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
          {t("actions.edit")}
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
