import { useTranslation } from "react-i18next";
import { CommentForList } from "../types";
import { CommentCard } from "./CommentCard";

type commentListProps = {
  comments: CommentForList[];
  noCommentMessage?: string;
};
export default function CommentList({
  comments,
  noCommentMessage,
}: commentListProps) {
  const { t } = useTranslation("comments");
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}

      {comments.length === 0 && (
        <div className="flex justify-center">
          {noCommentMessage ?? t("empty")}
        </div>
      )}
    </div>
  );
}
