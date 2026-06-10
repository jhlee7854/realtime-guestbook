import type {
  Comment,
  GuestbookPost,
  GuestbookPostWithCount,
  NewComment,
  NewGuestbookPost
} from "@/types/guestbook";
import { getSupabaseBrowserClient, storageBucket } from "./client";

function getUploadPath(id: string, imageType: NewGuestbookPost["imageType"], ext?: string) {
  const folder = imageType === "drawing" ? "drawings" : "uploads";
  const safeExt = imageType === "drawing" ? "png" : ext?.replace(/[^a-zA-Z0-9]/g, "") || "png";
  return { folder, fileName: `${id}.${safeExt}` };
}

export async function createGuestbookPost(input: NewGuestbookPost) {
  const supabase = getSupabaseBrowserClient();
  const id = crypto.randomUUID();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("방명록을 남기려면 로그인이 필요합니다.");
  }

  const { folder, fileName } = getUploadPath(id, input.imageType, input.fileExtension);
  const path = `users/${user.id}/${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(storageBucket)
    .upload(path, input.imageFile, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrl } = supabase.storage.from(storageBucket).getPublicUrl(path);

  const { data, error } = await supabase
    .from("guestbook_posts")
    .insert({
      id,
      user_id: user.id,
      author_name: input.authorName.trim(),
      message: input.message.trim(),
      image_url: publicUrl.publicUrl,
      image_type: input.imageType
    })
    .select("*")
    .single<GuestbookPost>();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchGuestbookPosts(): Promise<GuestbookPostWithCount[]> {
  const supabase = getSupabaseBrowserClient();
  const { data: posts, error } = await supabase
    .from("guestbook_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<GuestbookPost[]>();

  if (error) {
    throw error;
  }

  const postIds = posts.map((post) => post.id);
  const counts = new Map<string, number>();

  if (postIds.length > 0) {
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("post_id")
      .in("post_id", postIds)
      .returns<Array<Pick<Comment, "post_id">>>();

    if (commentsError) {
      throw commentsError;
    }

    comments.forEach((comment) => {
      counts.set(comment.post_id, (counts.get(comment.post_id) ?? 0) + 1);
    });
  }

  return posts.map((post) => ({
    ...post,
    comment_count: counts.get(post.id) ?? 0
  }));
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .returns<Comment[]>();

  if (error) {
    throw error;
  }

  return data;
}

export async function createComment(input: NewComment): Promise<Comment> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("댓글을 남기려면 로그인이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: input.postId,
      user_id: user.id,
      author_name: input.authorName.trim(),
      content: input.content.trim()
    })
    .select("*")
    .single<Comment>();

  if (error) {
    throw error;
  }

  return data;
}
