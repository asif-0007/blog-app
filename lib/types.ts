export interface Post {
  id: number;
  created_at: string;
  title: string;
  content: string;
  author_id: string;
  image_url?: string;
}

export interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
}

export interface PostWithAuthor extends Post {
  author_email: string;
  author_username?: string;
  author_avatar?: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    avatar_url?: string;
  };
} 