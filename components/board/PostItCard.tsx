"use client";

import type { GuestbookPostWithCount } from "@/types/guestbook";

type PostItCardProps = {
  post: GuestbookPostWithCount;
  index: number;
  onOpen: (post: GuestbookPostWithCount) => void;
};

const colors = ["#fff3a7", "#ffd7df", "#d9f99d", "#bfdbfe", "#fde68a", "#e9d5ff"];
const rotations = ["-2.5deg", "1.8deg", "-1.2deg", "2.4deg", "-1.8deg", "1.1deg"];

export function PostItCard({ post, index, onOpen }: PostItCardProps) {
  return (
    <button
      type="button"
      className="post-it"
      style={{
        backgroundColor: colors[index % colors.length],
        transform: `rotate(${rotations[index % rotations.length]})`
      }}
      onClick={() => onOpen(post)}
      aria-label={`${post.author_name}님의 방명록 상세 보기`}
    >
      <img src={post.image_url} alt="" className="post-it-image" />
      <span className="post-it-author">{post.author_name}</span>
      <span className="post-it-message">{post.message}</span>
      <span className="post-it-meta">
        댓글 {post.comment_count}개 · {new Date(post.created_at).toLocaleDateString("ko-KR")}
      </span>
    </button>
  );
}
