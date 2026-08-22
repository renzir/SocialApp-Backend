import type { GraphQLContext } from "../../middleware/authContext.js";
import { notificationService } from "./NotificationService.js";

export const notificationResolvers = {
  Query: {
    getUserNotifications: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }
      return notificationService.getUserNotifications(context.user.id);
    },

    getUnreadNotificationsCount: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }
      return notificationService.getUnreadCount(context.user.id);
    },
  },

  Mutation: {
    markNotificationAsRead: async (
      _: unknown,
      args: { notificationId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      const notifIdNum = parseInt(args.notificationId, 10);
      if (isNaN(notifIdNum)) throw new Error("ID de notificación inválido");

      await notificationService.markAsRead(notifIdNum, context.user.id);

      return {
        success: true,
        message: "Notificación marcada como leída",
      };
    },

    markAllNotificationsAsRead: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ) => {
      if (!context.user || !context.user.id) {
        throw new Error("No estás autenticado");
      }

      await notificationService.markAllAsRead(context.user.id);

      return {
        success: true,
        message: "Todas las notificaciones se marcaron como leídas",
      };
    },
  },
};