import pool from "../../db/database.js";
import { notificationService } from "../notifications/NotificationService.js";
import { friendshipQueries } from "./friendshipQueries.js";

export const friendshipService = {
  async sendFriendRequest(userId: number, friendId: number): Promise<boolean> {
    if (userId === friendId) {
      throw new Error("No puedes enviarte una solicitud a ti mismo");
    }

    const [rows]: [any[], any] = await pool.execute(
      friendshipQueries.checkExistingFriendship,
      [userId, friendId, friendId, userId],
    );

    const existingRelationship = rows[0];

    if (existingRelationship) {
      if (existingRelationship.status === "blocked") {
        throw new Error("No es posible realizar esta acción");
      }

      await pool.execute(friendshipQueries.updateFriendshipToPending, [
        userId,
        friendId,
        existingRelationship.sender_id,
        existingRelationship.receiver_id,
      ]);
    } else {
      await pool.execute(friendshipQueries.insertFriendshipPending, [
        userId,
        friendId,
      ]);
    }

    // Notificar al receptor sobre la solicitud de amistad solo si no estaba pendiente
    if (existingRelationship?.status !== "pending") {
      await notificationService.createNotification(
        friendId,
        "new_friend_request",
        userId,
      );
    }

    return true;
  },

  async acceptFriendRequest(
    userId: number,
    requestId: number,
  ): Promise<boolean> {
    // 1. Obtener la solicitud para verificar el emisor y el receptor
    const [rows]: [any[], any] = await pool.execute(
      friendshipQueries.getFriendshipById,
      [requestId],
    );

    const friendship = rows[0];

    if (!friendship || friendship.receiver_id !== userId) {
      throw new Error("No hay una solicitud pendiente para aceptar");
    }

    const senderId = friendship.sender_id;

    // 2. Actualizar el estado de la solicitud
    await pool.execute(friendshipQueries.acceptFriendRequest, [
      senderId,
      userId,
    ]);

    // 3. Notificar al emisor original que su solicitud fue aceptada
    await notificationService.createNotification(
      senderId,
      "friend_request_accepted",
      userId,
    );

    return true;
  },

  async cancelFriendRequest(
    userId: number,
    friendId: number,
  ): Promise<boolean> {
    const [result]: [any, any] = await pool.execute(
      friendshipQueries.cancelFriendRequest,
      [userId, friendId, friendId, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error("No hay una solicitud pendiente para cancelar");
    }

    return true;
  },

  async getFriendshipStatus(
    userId: number,
    friendId: number,
  ): Promise<string | null> {
    const [rows]: [any[], any] = await pool.execute(
      friendshipQueries.getFriendshipStatus,
      [userId, friendId, friendId, userId],
    );

    if (!rows || rows.length === 0) return null;
    return rows[0].status;
  },
};
