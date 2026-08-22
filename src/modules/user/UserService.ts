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

  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(userQueries.searchUsers, [
      searchTerm,
      searchTerm,
      limit,
    ]);
    return rows as User[];
  }

  async getMuroPosts(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<{ posts: any[]; totalCount: number }> {
    const countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      LEFT JOIN friendships f ON (
        (f.sender_id = p.user_id AND f.receiver_id = ?) OR
        (f.receiver_id = p.user_id AND f.sender_id = ?)
      )
      WHERE (p.user_id = ? OR f.status = 'confirmed')
        AND p.user_id NOT IN (
          SELECT blocked_id FROM blocks WHERE blocker_id = ?
          UNION
          SELECT blocker_id FROM blocks WHERE blocked_id = ?
        )
    `;

    const dataSql = `
      SELECT
        p.id,
        p.user_id,
        p.content,
        p.created_at,
        p.updated_at,
        u.username AS autor,
        u.profile_image_url AS imagen_perfil,
        GROUP_CONCAT(i.image_url ORDER BY i.order_index ASC) AS fotos
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN friendships f ON (
        (f.sender_id = p.user_id AND f.receiver_id = ?) OR
        (f.receiver_id = p.user_id AND f.sender_id = ?)
      )
      LEFT JOIN post_images i ON p.id = i.post_id
      WHERE (p.user_id = ? OR f.status = 'confirmed')
        AND p.user_id NOT IN (
          SELECT blocked_id FROM blocks WHERE blocker_id = ?
          UNION
          SELECT blocker_id FROM blocks WHERE blocked_id = ?
        )
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [countRows]: [any[], any] = await pool.execute(countSql, [
      userId,
      userId,
      userId,
      userId,
      userId,
    ]);
    const totalCount = countRows[0].total;

    const [posts]: [any[], any] = await pool.execute(dataSql, [
      userId,
      userId,
      userId,
      userId,
      userId,
      limit,
      offset,
    ]);

    return { posts, totalCount };
  }
}

export const userService = new UserService();
