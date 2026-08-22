import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../../db/database.js";
import { notificationService } from "../notifications/NotificationService.js";
import { postQueries } from "../post/postQueries.js";
import { postLikeQueries } from "./postLikeQueries.js";

interface LikeCountRow extends RowDataPacket {
  like_count: number;
}

export const postLikeService = {
  async addLikePost(postId: number, userId: number): Promise<boolean> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [existing] = await conn.execute<RowDataPacket[]>(
        postLikeQueries.checkPostLikeExists,
        [postId, userId],
      );

      if (existing && existing.length > 0) {
        await conn.rollback();
        throw new Error("Ya te gusta esta publicación");
      }

      await conn.execute(postLikeQueries.insertPostLike, [postId, userId]);

      // Buscar autor de la publicación para notificar
      const [postRows] = await conn.execute<RowDataPacket[]>(
        postQueries.checkPostUserId,
        [postId],
      );

      const postAuthorId = postRows[0]?.user_id;

      await conn.commit();

      // Notificar al autor si no es la misma persona que da el like
      if (postAuthorId && postAuthorId !== userId) {
        await notificationService.createNotification(
          postAuthorId,
          "like_post",
          userId,
          postId,
        );
      }

      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async removeLikePost(postId: number, userId: number): Promise<boolean> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute<ResultSetHeader>(
        postLikeQueries.deletePostLike,
        [postId, userId],
      );

      const affectedRows = result.affectedRows || 0;

      if (affectedRows > 0) {
        // Buscar autor de la publicación para eliminar su notificación
        const [postRows] = await conn.execute<RowDataPacket[]>(
          postQueries.checkPostUserId,
          [postId],
        );

        const postAuthorId = postRows[0]?.user_id;

        if (postAuthorId) {
          await notificationService.deleteNotification(
            postAuthorId,
            "like_post",
            userId,
            postId,
          );
        }
      }

      await conn.commit();
      return affectedRows > 0;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async getLikeCount(postId: number): Promise<number> {
    const [rows] = await pool.execute<LikeCountRow[]>(
      postLikeQueries.getPostLikeCountByPostId,
      [postId],
    );

    return rows[0]?.like_count || 0;
  },

  async hasLiked(postId: number, userId: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      postLikeQueries.getPostLikeByPostIdAndUserId,
      [postId, userId],
    );

    return rows.length > 0;
  },
};
