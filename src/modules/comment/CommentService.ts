import pool from "../../db/database.js";
import type { Comment } from "../../types/index.js";
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

    const [rows]: [any[], any] = await pool.execute(
      commentQueries.findCommentWithUserById,
      [newCommentId],
    );

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

  async getComments(postId: number): Promise<Comment[]> {
    const [rows]: [any[], any] = await pool.execute(
      commentQueries.getCommentsByPostId,
      [postId],
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
