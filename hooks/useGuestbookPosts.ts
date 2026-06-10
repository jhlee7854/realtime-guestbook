"use client";

import { useEffect, useState } from "react";
import { fetchGuestbookPosts } from "@/lib/supabase/guestbook";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Comment, GuestbookPost, GuestbookPostWithCount } from "@/types/guestbook";

export function useGuestbookPosts() {
  const [posts, setPosts] = useState<GuestbookPostWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      setError("Supabase 환경 변수를 설정하면 실시간 보드를 사용할 수 있습니다.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let isMounted = true;

    fetchGuestbookPosts()
      .then((data) => {
        if (isMounted) {
          setPosts(data);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const postChannel = supabase
      .channel("guestbook-posts-board")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guestbook_posts" },
        (payload) => {
          const post = payload.new as GuestbookPost;
          setPosts((current) => {
            if (current.some((item) => item.id === post.id)) {
              return current;
            }
            return [{ ...post, comment_count: 0 }, ...current];
          });
        }
      )
      .subscribe();

    const commentChannel = supabase
      .channel("guestbook-comments-counts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          const comment = payload.new as Comment;
          setPosts((current) =>
            current.map((post) =>
              post.id === comment.post_id
                ? { ...post, comment_count: post.comment_count + 1 }
                : post
            )
          );
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(postChannel);
      void supabase.removeChannel(commentChannel);
    };
  }, []);

  return { posts, isLoading, error };
}
