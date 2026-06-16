"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuthUser } from "@/hooks/useAuthUser";
import { createComment } from "@/lib/supabase/guestbook";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type CommentFormProps = {
  postId: string;
};

export function CommentForm({ postId }: CommentFormProps) {
  const { user, isLoading: isAuthLoading } = useAuthUser();
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!authorName.trim() || !content.trim()) {
      setError("댓글 이름과 내용을 입력해 주세요.");
      return;
    }

    if (!isSupabaseConfigured) {
      setError("Supabase 환경 변수를 먼저 설정해 주세요.");
      return;
    }

    if (!user) {
      setError("댓글을 남기려면 로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createComment({ postId, authorName, content });
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading) {
    return <p className="helper-text">로그인 상태를 확인하는 중입니다...</p>;
  }

  if (!user) {
    return (
      <div className="auth-gate compact">
        <p className="helper-text">댓글 작성은 로그인 사용자만 할 수 있습니다.</p>
        <Link href="/login" className="secondary-link">
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label>
        댓글 이름
        <input
          value={authorName}
          maxLength={40}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="이름"
          required
        />
      </label>
      <label>
        댓글 내용
        <textarea
          value={content}
          maxLength={180}
          onChange={(event) => setContent(event.target.value)}
          placeholder="따뜻한 댓글을 남겨 주세요."
          required
        />
      </label>
      {error && <p className="form-message error" role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "댓글 등록 중..." : "댓글 남기기"}
      </button>
    </form>
  );
}
