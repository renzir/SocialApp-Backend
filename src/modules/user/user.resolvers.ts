import pool from "../../db/database.js";
import type { Post, User } from "../../types/index.js";
import { authServices } from "../auth/AuthService.js";
import { commentService } from "../comment/CommentService.js";
import { postService } from "../post/PostService.js";
import { userService } from "./UserService.js";

// Tipos locales para asegurar compatibilidad con GraphQL
interface UpdateProfileInput {
  bio?: string;
  banner_image_url?: string;
}

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: any): Promise<User | null> => {
      if (!context.user || !context.user.id) return null;
      return userService.getUserById(context.user.id);
    },

    getProfile: async (
      _: unknown,
      args: { username: string },
    ): Promise<User | null> => {
      return authServices.findUserByUsername(args.username);
    },

    getMuro: async (_: unknown, __: unknown, context: any): Promise<Post[]> => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const userId = context.user.id;
      const sql = `
        SELECT 
          p.id,
          p.user_id,
          p.content,
          p.created_at,
          p.updated_at,
          u.username AS autor,
          u.profile_image_url AS imagen_perfil,
          GROUP_CONCAT(i.image_url ORDER BY i.order_index ASC) AS fotos
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN friendships f ON (
          (f.sender_id = p.user_id AND f.receiver_id = ?) OR 
          (f.receiver_id = p.user_id AND f.sender_id = ?)
        )
        LEFT JOIN post_images i ON p.id = i.post_id
        WHERE (p.user_id = ? OR f.status = 'confirmed')
          AND p.user_id NOT IN (
            SELECT blocked_id FROM blocks WHERE blocker_id = ?
            UNION
            SELECT blocker_id FROM blocks WHERE blocked_id = ?
          )
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;

      const [rows]: [any[], any] = await pool.execute(sql, [
        userId,
        userId,
        userId,
        userId,
        userId,
      ]);

      return rows.map((post: any) => {
        const imageUrls: string[] = post.fotos ? post.fotos.split(",") : [];
        const images = imageUrls.map((url, idx) => ({
          id: idx + 1,
          post_id: post.id,
          image_url: url,
          order_index: idx,
          created_at: post.created_at,
        }));

        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          autor: post.autor,
          imagen_perfil: post.imagen_perfil,
          images,
          created_at: post.created_at,
          updated_at: post.updated_at,
        };
      });
    },

    friendsList: async (
      _: unknown,
      args: { userId: string },
    ): Promise<User[]> => {
      const userId = parseInt(args.userId, 10);
      if (isNaN(userId)) throw new Error("ID de usuario inválido");
      return userService.getFriendsList(userId);
    },

    getSuggestedUsers: async (
      _: unknown,
      args: { userId: string },
    ): Promise<User[]> => {
      const userId = parseInt(args.userId, 10);
      if (isNaN(userId)) throw new Error("ID de usuario inválido");
      return userService.getSuggestedUsers(userId);
    },
  },

  Mutation: {
    updateProfile: async (
      _: unknown,
      args: { input: UpdateProfileInput },
      context: any,
    ): Promise<User> => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const userId = context.user.id;
      const validated = updateProfileSchema.parse(args.input);

      return userService.updateUserProfile(userId, validated as any);
    },

    blockUser: async (_: unknown, args: { userId: string }, context: any) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const blockerId = context.user.id;
      const targetUserId = parseInt(args.userId, 10);

      if (isNaN(targetUserId)) throw new Error("ID de usuario inválido");
      if (blockerId === targetUserId) {
        throw new Error("No puedes bloquearte a ti mismo");
      }

      await userService.blockUser(blockerId, targetUserId);

      return { success: true, message: "Usuario bloqueado correctamente" };
    },

    unblockUser: async (_: unknown, args: { userId: string }, context: any) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const blockerId = context.user.id;
      const targetUserId = parseInt(args.userId, 10);

      if (isNaN(targetUserId)) throw new Error("ID de usuario inválido");

      await userService.unblockUser(blockerId, targetUserId);

      return { success: true, message: "Usuario desbloqueado correctamente" };
    },

    createPost: async (
      _: unknown,
      args: { content: string; images?: string[] },
      context: any,
    ): Promise<Post> => {
      if (!context.user || !context.user.id)
        throw new Error("No estás autenticado");

      const userId = context.user.id;
      return postService.createPost(userId, args.content, args.images || []);
    },

    createComment: async (
      _: unknown,
      args: { postId: string; content: string },
      context: any,
    ) => {
      if (!context.user || !context.user.id)
        throw new Error("No estás autenticado");

      const userId = context.user.id;
      const validated = createCommentSchema.parse({
        content: args.content,
        post_id: args.postId,
      });

      return commentService.createComment(
        userId,
        validated.post_id,
        validated.content,
      );
    },
  },
};
