import { CommentCard } from "./CommentCard";
import { CommentForList } from "../types";

type commentListProps = {
  comments: CommentForList[];
  noCommentMessage?: string;
};
export default function CommentList({
  comments,
  noCommentMessage = "No comments yet",
}: commentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}

      {comments.length === 0 && (
        <div className="flex justify-center">{noCommentMessage}</div>
      )}
    </div>
  );
}
