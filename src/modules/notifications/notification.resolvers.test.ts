import { beforeEach, describe, expect, it, vi } from "vitest";
import { notificationResolvers } from "./notification.resolvers.js";
import { notificationService } from "./NotificationService.js";

vi.mock("./NotificationService.js", () => ({
  notificationService: {
    getUserNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

describe("notificationResolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Query.getUserNotifications", () => {
    it("debe lanzar error si no está autenticado", async () => {
      await expect(
        notificationResolvers.Query.getUserNotifications({}, {}, {
          user: null,
        } as any),
      ).rejects.toThrow("No estás autenticado");
    });

    it("debe retornar las notificaciones si está autenticado", async () => {
      vi.mocked(notificationService.getUserNotifications).mockResolvedValue([]);

      const result = await notificationResolvers.Query.getUserNotifications(
        {},
        {},
        { user: { id: 1 } } as any,
      );

      expect(result).toEqual([]);
      expect(notificationService.getUserNotifications).toHaveBeenCalledWith(1);
    });
  });

  describe("Query.getUnreadNotificationsCount", () => {
    it("debe lanzar error si no está autenticado", async () => {
      await expect(
        notificationResolvers.Query.getUnreadNotificationsCount({}, {}, {
          user: null,
        } as any),
      ).rejects.toThrow("No estás autenticado");
    });

    it("debe retornar el conteo de notificaciones no leídas si está autenticado", async () => {
      vi.mocked(notificationService.getUnreadCount).mockResolvedValue(3);

      const result =
        await notificationResolvers.Query.getUnreadNotificationsCount({}, {}, {
          user: { id: 1 },
        } as any);

      expect(result).toBe(3);
      expect(notificationService.getUnreadCount).toHaveBeenCalledWith(1);
    });
  });

  describe("Mutation.markNotificationAsRead", () => {
    it("debe lanzar error si no está autenticado", async () => {
      await expect(
        notificationResolvers.Mutation.markNotificationAsRead(
          {},
          { notificationId: "1" },
          { user: null } as any,
        ),
      ).rejects.toThrow("No estás autenticado");
    });

    it("debe validar que el ID de notificación sea un número válido", async () => {
      await expect(
        notificationResolvers.Mutation.markNotificationAsRead(
          {},
          { notificationId: "abc" },
          { user: { id: 1 } } as any,
        ),
      ).rejects.toThrow("ID de notificación inválido");
    });

    it("debe marcar como leída exitosamente y retornar respuesta esperada", async () => {
      vi.mocked(notificationService.markAsRead).mockResolvedValue(true);

      const result =
        await notificationResolvers.Mutation.markNotificationAsRead(
          {},
          { notificationId: "10" },
          { user: { id: 1 } } as any,
        );

      expect(notificationService.markAsRead).toHaveBeenCalledWith(10, 1);
      expect(result).toEqual({
        success: true,
        message: "Notificación marcada como leída",
      });
    });
  });

  describe("Mutation.markAllNotificationsAsRead", () => {
    it("debe lanzar error si no está autenticado", async () => {
      await expect(
        notificationResolvers.Mutation.markAllNotificationsAsRead({}, {}, {
          user: null,
        } as any),
      ).rejects.toThrow("No estás autenticado");
    });

    it("debe marcar todas las notificaciones como leídas exitosamente", async () => {
      vi.mocked(notificationService.markAllAsRead).mockResolvedValue(true);

      const result =
        await notificationResolvers.Mutation.markAllNotificationsAsRead(
          {},
          {},
          { user: { id: 1 } } as any,
        );

      expect(notificationService.markAllAsRead).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        message: "Todas las notificaciones se marcaron como leídas",
      });
    });
  });
});
