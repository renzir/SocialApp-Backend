import fs from "fs";
import path from "path";
import pool from "../../db/database.js";
import type { Post, PostImage } from "../../types/index.js";
import { postQueries } from "./postQueries.js";

export const postService = {
  async createPost(
    userId: number,
    content: string,
    imageUrls: string[] = [],
  ): Promise<Post> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result]: [any, any] = await conn.execute(postQueries.insertPost, [
        userId,
        content,
      ]);
      const newPostId = result.insertId;

      const insertedImages: PostImage[] = [];

      if (imageUrls && imageUrls.length > 0) {
        for (let idx = 0; idx < imageUrls.length; idx++) {
          const url = imageUrls[idx];
          const [imgResult]: [any, any] = await conn.execute(
            postQueries.insertPostImage,
            [newPostId, url, idx],
          );

          insertedImages.push({
            id: imgResult.insertId || `${newPostId}-${idx}`,
            post_id: newPostId,
            image_url: url,
            order_index: idx,
            created_at: new Date().toISOString(),
          });
        }
      }

      await conn.commit();

      const [userRows]: [any[], any] = await pool.execute(
        postQueries.findUserPostHeaderById,
        [userId],
      );
      const user = userRows[0];

      return {
        id: newPostId,
        user_id: userId,
        content,
        autor: user?.username,
        imagen_perfil: user?.profile_image_url,
        images: insertedImages,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async getPostById(postId: number): Promise<Post | null> {
    const [rows]: [any[], any] = await pool.execute(postQueries.getPostById, [
      postId,
    ]);

    if (!rows || rows.length === 0) return null;

    const postRow = rows[0];
    const images: PostImage[] = rows
      .filter((row) => row.image_url !== null)
      .map((row) => ({
        id: row.image_id,
        post_id: row.id,
        image_url: row.image_url,
        order_index: row.order_index || 0,
        created_at: row.image_created_at,
      }));

    return {
      id: postRow.id,
      user_id: postRow.user_id,
      content: postRow.content,
      autor: postRow.autor,
      imagen_perfil: postRow.imagen_perfil,
      images,
      created_at: postRow.created_at,
      updated_at: postRow.updated_at,
    };
  },

  async getAllPosts(): Promise<Post[]> {
    const [rows]: [any[], any] = await pool.execute(postQueries.getAllPosts);

    const postsGrouped: Post[] = rows.reduce((acc: Post[], row: any) => {
      let post = acc.find((p) => p.id === row.id);
      if (!post) {
        post = {
          id: row.id,
          user_id: row.user_id,
          content: row.content,
          autor: row.autor,
          imagen_perfil: row.imagen_perfil,
          images: [],
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
        acc.push(post);
      }

      if (row.image_url !== null && post && post.images) {
        post.images.push({
          id: row.image_id,
          post_id: row.id,
          image_url: row.image_url,
          order_index: row.order_index || 0,
          created_at: row.image_created_at,
        });
      }
      return acc;
    }, []);

    return postsGrouped;
  },

  async modifyPost(
    postId: number,
    userId: number,
    content: string,
    newImageUrls?: string[],
  ): Promise<Post> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [checkResult]: [any[], any] = await conn.execute(
        postQueries.checkPostUserId,
        [postId],
      );

      if (!checkResult || checkResult.length === 0) {
        throw new Error("La publicación no existe");
      }

      if (checkResult[0].user_id !== userId) {
        throw new Error("No tienes permisos para modificar esta publicación");
      }

      await conn.execute(postQueries.updatePostContent, [content, postId]);

      if (newImageUrls !== undefined) {
        await conn.execute(postQueries.deletePostImagesByPostId, [postId]);

        for (let idx = 0; idx < newImageUrls.length; idx++) {
          await conn.execute(postQueries.insertPostImage, [
            postId,
            newImageUrls[idx],
            idx,
          ]);
        }
      }

      await conn.commit();

      const updatedPost = await this.getPostById(postId);
      if (!updatedPost)
        throw new Error("Error al obtener la publicación actualizada");

      return updatedPost;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async deletePost(postId: number, userId: number): Promise<boolean> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [checkResult]: [any[], any] = await conn.execute(
        postQueries.checkPostUserId,
        [postId],
      );

      if (!checkResult || checkResult.length === 0) {
        throw new Error("La publicación no existe");
      }

      if (checkResult[0].user_id !== userId) {
        throw new Error("No tienes permisos para eliminar esta publicación");
      }

      const [images]: [any[], any] = await conn.execute(
        postQueries.getPostImageUrlsByPostId,
        [postId],
      );

      if (images && images.length > 0) {
        const uploadsDir = path.resolve(process.cwd(), "uploads");

        images.forEach((img: { image_url: string }) => {
          const filePath = path.resolve(img.image_url);
          if (
            filePath.startsWith(uploadsDir + path.sep) ||
            filePath === uploadsDir
          ) {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } else {
            console.warn(
              `Intento de eliminación fuera del directorio de uploads bloqueado: ${filePath}`,
            );
          }
        });
      }

      await conn.execute(postQueries.deletePostImagesByPostId, [postId]);
      await conn.execute(postQueries.deletePostById, [postId]);

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },
};
