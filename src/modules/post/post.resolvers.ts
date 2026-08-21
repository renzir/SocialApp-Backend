import { createPostSchema, modifyPostSchema } from "../../types/zodSchemas.js";
import { postService } from "../post/PostService.js";

export const postResolvers = {
  Query: {
    getPostById: async (_: unknown, { postId }: { postId: string }) => {
      const idNum = parseInt(postId, 10);
      if (isNaN(idNum)) throw new Error("ID de publicación inválido");
      return postService.getPostById(idNum);
    },

    getAllPosts: async () => {
      return postService.getAllPosts();
    },
  },

  Mutation: {
    createPost: async (
      _: unknown,
      args: { content: string; images?: string[] },
      context: any,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const validated = createPostSchema.parse({ content: args.content });

      return postService.createPost(
        context.user.id,
        validated.content,
        args.images || [],
      );
    },

    modifyPost: async (
      _: unknown,
      args: { postId: string; content: string; images?: string[] },
      context: any,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const idNum = parseInt(args.postId, 10);
      if (isNaN(idNum)) throw new Error("ID de publicación inválido");

      const validated = modifyPostSchema.parse({ content: args.content });

      return postService.modifyPost(
        idNum,
        context.user.id,
        validated.content || args.content,
        args.images,
      );
    },

    deletePost: async (_: unknown, args: { postId: string }, context: any) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const idNum = parseInt(args.postId, 10);
      if (isNaN(idNum)) throw new Error("ID de publicación inválido");

      await postService.deletePost(idNum, context.user.id);
      return { success: true, message: "Post eliminado exitosamente" };
    },
  },
};
