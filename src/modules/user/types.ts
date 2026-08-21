export interface UpdateProfileInput {
  username?: string;
  bio?: string;
  profile_image_url?: string;
  banner_image_url?: string;
}

export interface UserRow {
  id: number;
  username: string;
  email?: string;
  email_verified?: boolean;
  profile_image_url?: string;
  banner_image_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}
