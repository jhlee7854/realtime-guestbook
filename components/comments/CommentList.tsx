"use client";

import type { Comment } from "@/types/guestbook";

type CommentListProps = {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
};

export function CommentList({ comments, isLoading, error }: CommentListProps) {
  if (isLoading) {
    return <p className="helper-text">댓글을 불러오는 중입니다...</p>;
  }

  if (error) {
    return <p className="form-message error">{error}</p>;
  }

  if (comments.length === 0) {
    return <p className="helper-text">아직 댓글이 없습니다. 첫 댓글을 남겨 보세요.</p>;
  }

  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <li key={comment.id}>
          <div>
            <strong>{comment.author_name}</strong>
            <time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleString("ko-KR")}</time>
          </div>
          <p>{comment.content}</p>
        </li>
      ))}
    </ul>
  );
}
