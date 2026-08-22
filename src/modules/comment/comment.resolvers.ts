import { createCommentSchema } from "../../types/zodSchemas.js";
import { commentService } from "./CommentService.js";

export const commentResolvers = {
  Query: {
    getComments: async (
      _: unknown,
      {
        postId,
        limit,
        offset,
      }: { postId: string; limit: number; offset: number },
    ) => {
      const postIdNum = parseInt(postId, 10);
      if (isNaN(postIdNum)) throw new Error("ID de publicación inválido");
      return commentService.getComments(postIdNum, limit, offset);
    },
  },

  Mutation: {
    createComment: async (
      _: unknown,
      args: { postId: string; content: string },
      context: any,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const validated = createCommentSchema.parse({
        content: args.content,
        post_id: args.postId,
      });

      return commentService.createComment(
        context.user.id,
        validated.post_id,
        validated.content,
      );
    },

    deleteComment: async (
      _: unknown,
      args: { commentId: string },
      context: any,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const commentIdNum = parseInt(args.commentId, 10);
      if (isNaN(commentIdNum)) throw new Error("ID de comentario inválido");

      await commentService.deleteComment(commentIdNum, context.user.id);
      return { success: true, message: "Comentario eliminado exitosamente" };
    },
  },
};
