import type { GraphQLContext } from "../../middleware/authContext.js";
import { commentLikeService } from "./CommentLikeService.js";
import { postLikeService } from "./PostLikeService.js";

export const likeResolvers = {
  Mutation: {
    addLikePost: async (
      _: unknown,
      args: { postId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const postIdNum = parseInt(args.postId, 10);
      if (isNaN(postIdNum)) throw new Error("ID de publicación inválido");

      await postLikeService.addLikePost(postIdNum, context.user.id);

      return {
        success: true,
        message: "Publicación marcada como favorita",
      };
    },

    removeLikePost: async (
      _: unknown,
      args: { postId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const postIdNum = parseInt(args.postId, 10);
      if (isNaN(postIdNum)) throw new Error("ID de publicación inválido");

      await postLikeService.removeLikePost(postIdNum, context.user.id);

      return {
        success: true,
        message: "Quitar favorito de la publicación",
      };
    },

    addLikeComment: async (
      _: unknown,
      args: { commentId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const commentIdNum = parseInt(args.commentId, 10);
      if (isNaN(commentIdNum)) throw new Error("ID de comentario inválido");

      await commentLikeService.addLikeComment(commentIdNum, context.user.id);

      return {
        success: true,
        message: "Comentario marcado como favorito",
      };
    },

    removeLikeComment: async (
      _: unknown,
      args: { commentId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const commentIdNum = parseInt(args.commentId, 10);
      if (isNaN(commentIdNum)) throw new Error("ID de comentario inválido");

      await commentLikeService.removeLikeComment(commentIdNum, context.user.id);

      return {
        success: true,
        message: "Quitar favorito del comentario",
      };
    },
  },
};
