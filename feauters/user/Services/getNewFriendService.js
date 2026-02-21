

const db = require("../../../db/database");

const getNewFriendService = async (userId) => {
  try {
    const [rows] = await db.execute(
      `
        SELECT u.id, u.name, u.email, u.avatar
        FROM users u
        WHERE u.id IN (
          SELECT f.friend_id
          FROM friendships f
          WHERE f.user_id = ? AND f.status = 'pending'
        )
      `,
      [userId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};