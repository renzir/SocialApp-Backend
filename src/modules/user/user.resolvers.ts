import type { Post, User } from "../../types/index.js";
import {
  createCommentSchema,
  updateProfileSchema,
} from "../../types/zodSchemas.js";
import { authServices } from "../auth/AuthService.js";
import { commentService } from "../comment/CommentService.js";
import { postService } from "../post/PostService.js";
import { userService } from "./UserService.js";

// Tipos locales para asegurar compatibilidad con GraphQL
interface UpdateProfileInput {
  bio?: string;
  banner_image_url?: string;
  profile_image_url?: string;
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

    searchUsers: async (
      _: unknown,
      args: { query: string; limit?: number },
    ): Promise<User[]> => {
      return userService.searchUsers(args.query, args.limit || 10);
    },

    getMuro: async (
      _: unknown,
      args: { limit: number; offset: number },
      context: any,
    ): Promise<{ posts: Post[]; total_count: number; has_more: boolean }> => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const userId = context.user.id;
      const limit = args.limit || 20;
      const offset = args.offset || 0;

      const { posts, totalCount } = await userService.getMuroPosts(
        userId,
        limit,
        offset,
      );

      const formattedPosts = posts.map((post: any) => {
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

      return {
        posts: formattedPosts,
        total_count: totalCount,
        has_more: totalCount > offset + posts.length,
      };
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
