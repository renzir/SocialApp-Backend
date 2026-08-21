import { friendshipService } from "./FriendshipService.js";

export const friendshipResolvers = {
  Query: {
    getFriendshipStatus: async (
      _: unknown,
      args: { friendId: string },
      context: any,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const friendIdNum = parseInt(args.friendId, 10);
      if (isNaN(friendIdNum)) throw new Error("ID de usuario inválido");

      return friendshipService.getFriendshipStatus(
        context.user.id,
        friendIdNum,
      );
    },
  },

  Mutation: {
    sendFriendRequest: async (
      _: unknown,
      args: { friendId: string },
      context: any,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const friendIdNum = parseInt(args.friendId, 10);
      if (isNaN(friendIdNum)) throw new Error("ID de usuario inválido");

      await friendshipService.sendFriendRequest(context.user.id, friendIdNum);

      return {
        success: true,
        message: "Solicitud de amistad enviada correctamente",
      };
    },

    acceptFriendRequest: async (
      _: unknown,
      args: { requestId: string },
      context: any,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const friendIdNum = parseInt(args.requestId, 10);
      if (isNaN(friendIdNum)) throw new Error("ID de usuario/solicitud inválido");

      await friendshipService.acceptFriendRequest(
        context.user.id,
        friendIdNum,
      );

      return {
        success: true,
        message: "Solicitud de amistad aceptada correctamente",
      };
    },

    cancelFriendRequest: async (
      _: unknown,
      args: { friendId: string },
      context: any,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const friendIdNum = parseInt(args.friendId, 10);
      if (isNaN(friendIdNum)) throw new Error("ID de usuario inválido");

      await friendshipService.cancelFriendRequest(
        context.user.id,
        friendIdNum,
      );

      return {
        success: true,
        message: "Solicitud de amistad cancelada correctamente",
      };
    },
  },
};
