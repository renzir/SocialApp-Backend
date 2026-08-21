export interface CommentRow {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  username?: string;
  perfil_imagen?: string;
}

export interface CreateCommentPayload {
  userId: number;
  postId: number;
  content: string;
}
