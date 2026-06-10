export type ImageType = "upload" | "drawing";

export type GuestbookPost = {
  id: string;
  user_id: string | null;
  author_name: string;
  message: string;
  image_url: string;
  image_type: ImageType;
  created_at: string;
  updated_at: string;
};

export type GuestbookPostWithCount = GuestbookPost & {
  comment_count: number;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
};

export type NewGuestbookPost = {
  authorName: string;
  message: string;
  imageFile: Blob;
  imageType: ImageType;
  fileExtension?: string;
};

export type NewComment = {
  postId: string;
  authorName: string;
  content: string;
};
