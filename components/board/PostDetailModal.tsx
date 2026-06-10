"use client";

import { useEffect, useRef } from "react";
import { useComments } from "@/hooks/useComments";
import type { GuestbookPostWithCount } from "@/types/guestbook";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";

type PostDetailModalProps = {
  post: GuestbookPostWithCount;
  onClose: () => void;
};

export function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { comments, isLoading, error } = useComments(post.id);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="post-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
        tabIndex={-1}
        ref={modalRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="상세 보기 닫기">
          ×
        </button>
        <img src={post.image_url} alt={`${post.author_name}님의 방명록 이미지`} className="modal-image" />
        <div className="modal-content">
          <p className="eyebrow">{post.image_type === "drawing" ? "직접 그린 그림" : "업로드 사진"}</p>
          <h2 id="post-modal-title">{post.author_name}님의 방명록</h2>
          <p>{post.message}</p>
          <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleString("ko-KR")}</time>
        </div>
        <section className="comments-section" aria-labelledby="comments-title">
          <h3 id="comments-title">실시간 댓글</h3>
          <CommentList comments={comments} isLoading={isLoading} error={error} />
          <CommentForm postId={post.id} />
        </section>
      </div>
    </div>
  );
}
