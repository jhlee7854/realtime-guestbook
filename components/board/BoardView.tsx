"use client";

import Link from "next/link";
import { useState } from "react";
import { useGuestbookPosts } from "@/hooks/useGuestbookPosts";
import type { GuestbookPostWithCount } from "@/types/guestbook";
import { PostDetailModal } from "./PostDetailModal";
import { PostItCard } from "./PostItCard";

export function BoardView() {
  const { posts, isLoading, error } = useGuestbookPosts();
  const [selectedPost, setSelectedPost] = useState<GuestbookPostWithCount | null>(null);

  return (
    <main className="board-page">
      <header className="board-header">
        <div>
          <p className="eyebrow">Realtime board</p>
          <h1>모두의 포스트잇 방명록</h1>
          <p>새 방명록과 댓글이 Supabase Realtime으로 자동 반영됩니다.</p>
        </div>
        <Link href="/" className="secondary-link">
          방명록 쓰기
        </Link>
      </header>

      {isLoading && <p className="board-state">방명록을 불러오는 중입니다...</p>}
      {error && <p className="board-state error">{error}</p>}
      {!isLoading && !error && posts.length === 0 && (
        <p className="board-state">아직 붙은 포스트잇이 없습니다. 첫 방명록을 남겨 보세요.</p>
      )}

      <section className="post-it-grid" aria-label="방명록 포스트잇 목록">
        {posts.map((post, index) => (
          <PostItCard key={post.id} post={post} index={index} onOpen={setSelectedPost} />
        ))}
      </section>

      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </main>
  );
}
