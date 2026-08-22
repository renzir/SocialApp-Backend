import pool from "../../db/database.js";
import type { Notification } from "../../types/index.js";
import { notificationQueries } from "./notificationQueries.js";

export interface NotificationWithDetails extends Notification {
  sender_username?: string;
  sender_profile_image?: string;
}

export const notificationService = {
  async createNotification(
    userId: number,
    type: Notification["type"],
    senderId: number,
    postId: number | null = null,
    commentId: number | null = null,
  ): Promise<void> {
    await pool.execute(notificationQueries.insertNotification, [
      userId,
      type,
      senderId,
      postId,
      commentId,
    ]);
  },

  async getUserNotifications(
    userId: number,
  ): Promise<NotificationWithDetails[]> {
    const [rows]: [any[], any] = await pool.execute(
      notificationQueries.getUserNotifications,
      [userId],
    );

    return rows.map((row: any) => ({
      id: row.id,
      user_id: userId,
      type: row.type,
      is_read: row.is_read === 1,
      created_at: row.created_at,
      sender_id: row.sender_id,
      sender_username: row.sender_username,
      sender_profile_image: row.sender_profile_image,
      post_id: row.post_id,
      comment_id: row.comment_id,
    }));
  },

  async getUnreadCount(userId: number): Promise<number> {
    const [rows]: [any[], any] = await pool.execute(
      notificationQueries.getUserUnreadNotificationsCount,
      [userId],
    );

    return rows[0]?.count || 0;
  },

  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const [result]: [any, any] = await pool.execute(
      notificationQueries.markAsRead,
      [notificationId, userId],
    );

    return (result.affectedRows || 0) > 0;
  },

  async markAllAsRead(userId: number): Promise<boolean> {
    const [result]: [any, any] = await pool.execute(
      notificationQueries.markAllAsRead,
      [userId],
    );

    return (result.affectedRows || 0) > 0;
  },

  async deleteNotification(
    userId: number,
    type: Notification["type"],
    senderId: number,
    postId: number | null = null,
    commentId: number | null = null,
  ): Promise<void> {
    await pool.execute(notificationQueries.deleteNotification, [
      userId,
      type,
      senderId,
      postId,
      commentId,
    ]);
  },
};
