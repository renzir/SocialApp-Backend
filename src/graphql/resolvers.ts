import { GraphQLContext } from "../middleware/authContext.js";
import { authServices } from "../modules/auth/AuthService.js";
import createCommentService from "../modules/comment/services/CreateCommentService.js";
import sendFriendRequestService from "../modules/friendships/services/SendFriendRequestService.js";
import createPostService from "../modules/post/Services/CreatePostService.js";
import getAllPostsService from "../modules/post/Services/getAllPostsService.js";
import type { Comment, Post, User } from "../types";

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  username: string;
  password: string;
}

interface CreatePostArgs {
  content: string;
  images?: string[];
}

interface CreateCommentArgs {
  postId: string;
  content: string;
}

export const resolvers = {
  Query: {
    hello: () => "¡Hola! Servidor GraphQL funcionando correctamente 🚀",

    me: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ): Promise<User | null> => {
      if (!context.user) return null;
      return authServices.findUserById(context.user.id);
    },

    getMuro: async (): Promise<Post[]> => {
      return getAllPostsService();
    },

    getProfile: async (
      _: unknown,
      args: { username: string },
    ): Promise<User | null> => {
      return authServices.findUserByUsername(args.username);
    },
  },

  Mutation: {
    register: async (_: unknown, { input }: { input: RegisterInput }) => {
      try {
        const user = await authServices.register(input);
        return {
          success: true,
          message:
            "Usuario registrado con éxito. Se ha enviado un correo de verificación.",
          user,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Error al registrar el usuario",
          user: null,
        };
      }
    },

    verifyEmail: async (_: unknown, { token }: { token: string }) => {
      try {
        await authServices.verifyEmailToken(token);
        return {
          success: true,
          message: "Email verificado correctamente",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Error al verificar el email",
        };
      }
    },

    login: async (
      _: unknown,
      { input }: { input: LoginInput },
      context: GraphQLContext,
    ) => {
      try {
        const { user, tokens } = await authServices.login(input);

        context.res.cookie("accessToken", tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        context.res.cookie("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        return {
          success: true,
          message: "Inicio de sesión exitoso",
          user,
          accessToken: tokens.accessToken,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Credenciales inválidas",
          user: null,
          accessToken: null,
        };
      }
    },

    logout: async (_: unknown, __: unknown, context: GraphQLContext) => {
      context.res.clearCookie("accessToken");
      context.res.clearCookie("refreshToken");
      return {
        success: true,
        message: "Sesión cerrada correctamente",
      };
    },

    createPost: async (
      _: unknown,
      args: CreatePostArgs,
      context: GraphQLContext,
    ): Promise<Post> => {
      if (!context.user) {
        throw new Error("No estás autenticado");
      }
      const userId = context.user.id;

      const result = await createPostService(userId, args.content, args.images);
      return {
        id: result.insertId,
        user_id: userId,
        content: args.content,
        created_at: new Date().toISOString(),
      };
    },

    sendFriendRequest: async (
      _: unknown,
      args: { friendId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("No estás autenticado");
      }
      const senderId = context.user.id;
      const friendId = parseInt(args.friendId, 10);

      await sendFriendRequestService(senderId, friendId);

      return {
        success: true,
        message: "Solicitud de amistad enviada correctamente",
      };
    },

    createComment: async (
      _: unknown,
      args: CreateCommentArgs,
      context: GraphQLContext,
    ): Promise<Comment> => {
      if (!context.user) {
        throw new Error("No estás autenticado");
      }
      const userId = context.user.id;
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
