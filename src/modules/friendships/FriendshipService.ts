import pool from "../../db/database.js";
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

    return true;
  },

  async acceptFriendRequest(
    userId: number,
    friendId: number,
  ): Promise<boolean> {
    const [result]: [any, any] = await pool.execute(
      friendshipQueries.acceptFriendRequest,
      [friendId, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error("No hay una solicitud pendiente para aceptar");
    }

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
