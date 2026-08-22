import pool from "../../db/database.js";
import type { Comment } from "../../types/index.js";
import { notificationService } from "../notifications/NotificationService.js";
import { postQueries } from "../post/postQueries.js";
import { commentQueries } from "./commentQueries.js";

export const commentService = {
  async createComment(
    userId: number,
    postId: number,
    content: string,
  ): Promise<Comment> {
    const [result]: [any, any] = await pool.execute(
      commentQueries.insertComment,
      [userId, postId, content],
    );

    const newCommentId = result.insertId;

    // Obtener el autor del post para la notificación
    const postResult = await pool.execute(postQueries.checkPostUserId, [
      postId,
    ]);
    const postRows = postResult[0] as any[];
    const postAuthorId = postRows[0]?.user_id;
    if (postAuthorId && postAuthorId !== userId) {
      await notificationService.createNotification(
        postAuthorId,
        "new_comment",
        userId,
        postId,
        newCommentId,
      );
    }

    const resultRows = await pool.execute(
      commentQueries.findCommentWithUserById,
      [newCommentId],
    );
    // Asegurarse de manejar el array de resultados devuelto por mysql2
    // console.log("DEBUG resultRows:", resultRows);
    const rows = (Array.isArray(resultRows) ? resultRows[0] : []) as any[];
    const commentRow = rows[0];
    return {
      id: newCommentId,
      post_id: postId,
      user_id: userId,
      content,
      username: commentRow?.username,
      perfil_imagen: commentRow?.perfil_imagen,
      created_at: commentRow?.created_at || new Date().toISOString(),
      updated_at: commentRow?.updated_at,
    };
  },

  async getComments(
    postId: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Comment[]> {
    const [rows]: [any[], any] = await pool.execute(
      commentQueries.getCommentsByPostId,
      [postId, limit, offset],
    );

    return rows.map((row: any) => ({
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      content: row.content,
      username: row.username,
      perfil_imagen: row.perfil_imagen,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  },

  async deleteComment(commentId: number, userId: number): Promise<boolean> {
    const [checkResult]: [any[], any] = await pool.execute(
      commentQueries.findCommentUserIdById,
      [commentId],
    );

    if (!checkResult || checkResult.length === 0) {
      throw new Error("El comentario no existe");
    }

    if (checkResult[0].user_id !== userId) {
      throw new Error("No tienes permiso para eliminar este comentario");
    }

    await pool.execute(commentQueries.deleteCommentById, [commentId]);

    return true;
  },
};
