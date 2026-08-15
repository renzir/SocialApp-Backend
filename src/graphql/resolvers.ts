import { findUserByUsername } from "../modules/auth/Services/UserService.js";
import createCommentService from "../modules/comment/services/CreateCommentService.js";
import sendFriendRequestService from "../modules/friendships/services/SendFriendRequestService.js";
import createPostService from "../modules/post/Services/CreatePostService.js";
import getAllPostsService from "../modules/post/Services/getAllPostsService.js";
import type { Comment, Post, User } from "../types";

export const resolvers = {
  Query: {
    hello: () => "¡Hola! Servidor GraphQL funcionando correctamente 🚀",

    me: async (_: any, __: any, context: any) => {
      return null;
    },

    getMuro: async (): Promise<Post[]> => {
      return getAllPostsService();
    },

    getProfile: async (
      _: any,
      args: { username: string },
    ): Promise<User | null> => {
      const user = await findUserByUsername(args.username);
      return user;
    },
  },

  Mutation: {
    createPost: async (
      _: any,
      args: { content: string; images?: string[] },
    ): Promise<Post> => {
      const userId = 1;

      const result = await createPostService(userId, args.content, args.images);
      return {
        id: result.insertId,
        user_id: userId,
        content: args.content,
        created_at: new Date().toISOString(),
      };
    },

    sendFriendRequest: async (_: any, args: { friendId: string }) => {
      const senderId = 1;
      const friendId = parseInt(args.friendId, 10);

      await sendFriendRequestService(senderId, friendId);

      return {
        success: true,
        message: "Solicitud de amistad enviada correctamente",
      };
    },

    createComment: async (
      _: any,
      args: { postId: string; content: string },
    ): Promise<Comment> => {
      const userId = 1;
      const postIdNum = parseInt(args.postId, 10);

      const result = await createCommentService(
        userId,
        postIdNum,
        args.content,
      );

      return {
        id: result[0].insertId,
        post_id: postIdNum,
        user_id: userId,
        content: args.content,
        created_at: new Date().toISOString(),
      };
    },
  },
};
