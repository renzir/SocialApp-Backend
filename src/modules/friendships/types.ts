export type FriendshipStatus = "pending" | "confirmed" | "blocked";

export interface FriendshipRow {
  sender_id: number;
  receiver_id: number;
  status: FriendshipStatus;
  created_at?: string;
  updated_at?: string;
}

export interface SendFriendRequestPayload {
  userId: number;
  friendId: number;
}
