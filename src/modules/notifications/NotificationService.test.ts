import { beforeEach, describe, expect, it, vi } from "vitest";
import pool from "../../db/database.js";
import { notificationService } from "./NotificationService.js";
import { notificationQueries } from "./notificationQueries.js";

vi.mock("../../db/database.js", () => ({
  default: {
    execute: vi.fn(),
  },
}));

const mockedPool = vi.mocked(pool, true);

describe("NotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNotification", () => {
    it("debe insertar una notificación con todos los parámetros", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 1 } as any,
        [],
      ]);

      await notificationService.createNotification(1, "like_post", 2, 10, 5);

      expect(mockedPool.execute).toHaveBeenCalledWith(
        notificationQueries.insertNotification,
        [1, "like_post", 2, 10, 5],
      );
    });

    it("debe insertar una notificación con valores nulos por defecto para postId y commentId", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 1 } as any,
        [],
      ]);

      await notificationService.createNotification(1, "new_friend_request", 2);

      expect(mockedPool.execute).toHaveBeenCalledWith(
        notificationQueries.insertNotification,
        [1, "new_friend_request", 2, null, null],
      );
    });

    it("debe propagar el error si pool.execute falla", async () => {
      mockedPool.execute.mockRejectedValueOnce(
        new Error("Error de base de datos"),
      );

      await expect(
        notificationService.createNotification(1, "like_post", 2),
      ).rejects.toThrow("Error de base de datos");
    });
  });

  describe("getUserNotifications", () => {
    it("debe retornar notificaciones formateadas correctamente", async () => {
      const mockRows = [
        {
          id: 1,
          type: "like_post",
          is_read: 0,
          created_at: "2023-10-27T10:00:00Z",
          sender_id: 2,
          sender_username: "user2",
          sender_profile_image: "img.jpg",
          post_id: 10,
          comment_id: null,
        },
        {
          id: 2,
          type: "like_comment",
          is_read: 1,
          created_at: "2023-10-27T11:00:00Z",
          sender_id: 3,
          sender_username: "user3",
          sender_profile_image: null,
          post_id: 10,
          comment_id: 5,
        },
      ];
      mockedPool.execute.mockResolvedValueOnce([mockRows as any, []]);

      const result = await notificationService.getUserNotifications(1);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        user_id: 1,
        type: "like_post",
        is_read: false,
        created_at: "2023-10-27T10:00:00Z",
        sender_id: 2,
        sender_username: "user2",
        sender_profile_image: "img.jpg",
        post_id: 10,
        comment_id: null,
      });
      expect(result[1]).toEqual({
        id: 2,
        user_id: 1,
        type: "like_comment",
        is_read: true,
        created_at: "2023-10-27T11:00:00Z",
        sender_id: 3,
        sender_username: "user3",
        sender_profile_image: null,
        post_id: 10,
        comment_id: 5,
      });
      expect(mockedPool.execute).toHaveBeenCalledWith(
        notificationQueries.getUserNotifications,
        [1],
      );
    });

    it("debe retornar un arreglo vacío si el usuario no tiene notificaciones", async () => {
      mockedPool.execute.mockResolvedValueOnce([[] as any, []]);

      const result = await notificationService.getUserNotifications(1);

      expect(result).toEqual([]);
    });

    it("debe propagar el error si la consulta falla", async () => {
      mockedPool.execute.mockRejectedValueOnce(
        new Error("Database connection lost"),
      );

      await expect(notificationService.getUserNotifications(1)).rejects.toThrow(
        "Database connection lost",
      );
    });
  });

  describe("getUnreadCount", () => {
    it("debe retornar el conteo de notificaciones no leídas", async () => {
      mockedPool.execute.mockResolvedValueOnce([[{ count: 5 }] as any, []]);

      const count = await notificationService.getUnreadCount(1);

      expect(count).toBe(5);
      expect(mockedPool.execute).toHaveBeenCalledWith(
        notificationQueries.getUserUnreadNotificationsCount,
        [1],
      );
    });

    it("debe retornar 0 si no hay resultados o count es falsy", async () => {
      mockedPool.execute.mockResolvedValueOnce([[] as any, []]);

      const count = await notificationService.getUnreadCount(1);

      expect(count).toBe(0);
    });

    it("debe propagar el error si la consulta falla", async () => {
      mockedPool.execute.mockRejectedValueOnce(
        new Error("Error al obtener conteo"),
      );

      await expect(notificationService.getUnreadCount(1)).rejects.toThrow(
        "Error al obtener conteo",
      );
    });
  });

  describe("markAsRead", () => {
    it("debe retornar true si se actualizó al menos una fila", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 1 } as any,
        [],
      ]);

      const result = await notificationService.markAsRead(10, 1);

      expect(result).toBe(true);
      expect(mockedPool.execute).toHaveBeenCalledWith(
        notificationQueries.markAsRead,
        [10, 1],
      );
    });

    it("debe retornar false si no se actualizó ninguna fila", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 0 } as any,
        [],
      ]);

      const result = await notificationService.markAsRead(999, 1);

      expect(result).toBe(false);
    });

    it("debe retornar false si result es undefined o no tiene affectedRows", async () => {
      mockedPool.execute.mockResolvedValueOnce([{} as any, []]);

      const result = await notificationService.markAsRead(10, 1);

      expect(result).toBe(false);
    });
  });

  describe("markAllAsRead", () => {
    it("debe retornar true si se marcaron todas las notificaciones como leídas", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 3 } as any,
        [],
      ]);

      const result = await notificationService.markAllAsRead(1);

      expect(result).toBe(true);
      expect(mockedPool.execute).toHaveBeenCalledWith(
        notificationQueries.markAllAsRead,
        [1],
      );
    });

    it("debe retornar false si no había notificaciones pendientes por leer", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 0 } as any,
        [],
      ]);

      const result = await notificationService.markAllAsRead(1);

      expect(result).toBe(false);
    });
  });

  describe("deleteNotification", () => {
    it("debe ejecutar la query de eliminación con los parámetros pasados", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 1 } as any,
        [],
      ]);

      await notificationService.deleteNotification(1, "like_post", 2, 10, null);

      expect(mockedPool.execute).toHaveBeenCalledWith(
        notificationQueries.deleteNotification,
        [1, "like_post", 2, 10, null],
      );
    });

    it("debe usar valores nulos por defecto para postId y commentId al eliminar", async () => {
      mockedPool.execute.mockResolvedValueOnce([
        { affectedRows: 1 } as any,
        [],
      ]);

      await notificationService.deleteNotification(1, "new_friend_request", 2);

      expect(mockedPool.execute).toHaveBeenCalledWith(
        notificationQueries.deleteNotification,
        [1, "new_friend_request", 2, null, null],
      );
    });
  });
});
