import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../../db/database.js";
import { commentQueries } from "../comment/commentQueries.js";
import { notificationService } from "../notifications/NotificationService.js";
import { commentLikeQueries } from "./commentLikeQueries.js";

interface LikeCountRow extends RowDataPacket {
  like_count: number;
}

export const commentLikeService = {
  async addLikeComment(commentId: number, userId: number): Promise<boolean> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [existing] = await conn.execute<RowDataPacket[]>(
        commentLikeQueries.checkCommentLikeExists,
        [commentId, userId],
      );

      if (existing && existing.length > 0) {
        await conn.rollback();
        throw new Error("Ya te gusta este comentario");
      }

      await conn.execute(commentLikeQueries.insertCommentLike, [
        commentId,
        userId,
      ]);

      // Consultar autor y post_id del comentario
      const [commentRows] = await conn.execute<RowDataPacket[]>(
        commentQueries.findCommentWithUserById,
        [commentId],
      );

      const commentAuthorId = commentRows[0]?.user_id;
      const postId = commentRows[0]?.post_id;

      await conn.commit();

      if (commentAuthorId && commentAuthorId !== userId) {
        await notificationService.createNotification(
          commentAuthorId,
          "like_comment",
          userId,
          postId,
          commentId,
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

  async removeLikeComment(commentId: number, userId: number): Promise<boolean> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.execute<ResultSetHeader>(
        commentLikeQueries.deleteCommentLike,
        [commentId, userId],
      );

      const affectedRows = result.affectedRows || 0;
      if (affectedRows > 0) {
        // Consultar autor y post_id del comentario
        const [commentRows] = await conn.execute<RowDataPacket[]>(
          commentQueries.findCommentWithUserById,
          [commentId],
        );

        const commentAuthorId = commentRows[0]?.user_id;
        const postId = commentRows[0]?.post_id;

        if (commentAuthorId) {
          await notificationService.deleteNotification(
            commentAuthorId,
            "like_comment",
            userId,
            postId,
            commentId,
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

  async getLikeCount(commentId: number): Promise<number> {
    const [rows] = await pool.execute<LikeCountRow[]>(
      commentLikeQueries.getCommentLikeCountByCommentId,
      [commentId],
    );

    return rows[0]?.like_count || 0;
  },

  async hasLiked(commentId: number, userId: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      commentLikeQueries.getCommentLikeByCommentIdAndUserId,
      [commentId, userId],
    );

    return rows.length > 0;
  },
};
