export interface CreatePostPayload {
  userId: number;
  content: string;
  imageUrls?: string[];
}

export interface ModifyPostPayload {
  postId: number;
  userId: number;
  content: string;
  newImageUrls?: string[];
}

export interface PostQueryRow {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  autor?: string;
  imagen_perfil?: string;
  image_id?: number | string;
  image_url?: string;
  order_index?: number;
  image_created_at?: string;
}
