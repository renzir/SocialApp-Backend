import { Request } from "express";

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string | null;
  profile_image_url?: string | null;
  banner_image_url?: string | null;
  bio?: string | null;
  is_active?: boolean;
  email_verified?: boolean;
  created_at?: string;
}

export interface PostImage {
  id: number;
  post_id: number;
  image_url: string;
  order_index: number;
  created_at?: string;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  images?: PostImage[];
  // Campos devueltos en las respuestas de GraphQL / JOINs con users
  autor?: string;
  imagen_perfil?: string;
  username?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  // Campos devueltos en las respuestas de GraphQL / JOINs con users
  username?: string;
  perfil_imagen?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface PostLike {
  id: number;
  post_id: number;
  user_id: number;
  created_at: string;
}

export interface CommentLike {
  id: number;
  comment_id: number;
  user_id: number;
  created_at: string;
}

export interface Friendship {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: "pending" | "confirmed" | "cancelled" | "blocked";
  created_at: string;
  updated_at?: string;
}

export interface Block {
  id: number;
  blocker_id: number;
  blocked_id: number;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type:
    | "like_post"
    | "like_comment"
    | "new_friend_request"
    | "friend_request_accepted"
    | "new_comment"
    | "new_message";
  sender_id: number;
  post_id?: number | null;
  comment_id?: number | null;
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface UserPayload {
  id: number;
  username: string;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
