"use client";

import { useEffect, useState } from "react";
import { fetchComments } from "@/lib/supabase/guestbook";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Comment } from "@/types/guestbook";

export function useComments(postId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(postId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setComments([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      setError("Supabase 환경 변수를 설정하면 댓글을 불러올 수 있습니다.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let isMounted = true;
    setIsLoading(true);

    fetchComments(postId)
      .then((data) => {
        if (isMounted) {
          setComments(data);
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

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          const comment = payload.new as Comment;
          setComments((current) => {
            if (current.some((item) => item.id === comment.id)) {
              return current;
            }
            return [...current, comment];
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [postId]);

  return { comments, isLoading, error };
}
