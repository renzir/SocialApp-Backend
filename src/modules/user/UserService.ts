import pool from "../../db/database.js";
import { User } from "../../types/index.js";
import { UpdateProfileInput } from "./types.js";
import { userQueries } from "./userQueries.js";

class UserService {
  // Obtener usuario por ID (para perfil propio o público)
  async getUserById(id: number): Promise<User | null> {
    const [rows] = await pool.execute(userQueries.getUserById, [id]);
    return (rows as User[])[0] || null;
  }

  // Actualizar perfil
  async updateUserProfile(
    userId: number,
    input: UpdateProfileInput,
  ): Promise<User> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { username, bio, profile_image_url, banner_image_url } = input;

      // Si se actualiza el username, verificar unicidad
      if (username) {
        const [existingUser] = await conn.execute(
          userQueries.checkUsernameUniqueExcludingUser,
          [username, userId],
        );
        if ((existingUser as any[]).length > 0) {
          throw new Error("El nombre de usuario ya está en uso");
        }
      }

      await conn.execute(userQueries.updateUserProfile, [
        username ?? null,
        bio ?? null,
        profile_image_url ?? null,
        banner_image_url ?? null,
        userId,
      ]);

      await conn.commit();

      // Devolver el perfil actualizado
      const [updatedProfile] = await pool.execute(userQueries.getUserById, [
        userId,
      ]);
      return (updatedProfile as User[])[0];
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // --- Lógica de Amistades ---

  async getFriendsList(userId: number): Promise<User[]> {
    const [rows] = await pool.execute(userQueries.getFriendsList, [
      userId,
      userId,
      userId,
      userId,
    ]);
    return rows as User[];
  }

  async getFriendRequests(userId: number): Promise<User[]> {
    const [rows] = await pool.execute(userQueries.getFriendRequests, [userId]);
    return rows as User[];
  }

  async blockUser(blockerId: number, blockedId: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Eliminar amistad existente si la hay
      await conn.execute(userQueries.deleteFriendshipBetweenUsers, [
        blockerId,
        blockedId,
        blockedId,
        blockerId,
      ]);

      // Registrar bloqueo
      await conn.execute(userQueries.insertOrUpdateBlock, [
        blockerId,
        blockedId,
      ]);

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    await pool.execute(userQueries.deleteBlock, [blockerId, blockedId]);
  }

  async isBlocked(userId: number, targetUserId: number): Promise<boolean> {
    const [rows] = await pool.execute(userQueries.checkBlockStatus, [
      userId,
      targetUserId,
      targetUserId,
      userId,
    ]);
    return (rows as any[]).length > 0;
  }

  async getSuggestedUsers(userId: number, limit: number = 10): Promise<User[]> {
    const [rows] = await pool.query(userQueries.getSuggestedUsers, [
      userId,
      userId,
      userId,
      userId,
      userId,
      userId,
      userId,
      limit,
    ]);
    return rows as User[];
  }
}

export const userService = new UserService();
