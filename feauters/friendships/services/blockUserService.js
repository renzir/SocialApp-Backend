const db = require("../../../db/database");

const blockUserService = async (userid, friendId) => {
  try {
    const query = `
      UPDATE friendships
      SET status = 'blocked'
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
    `;

    const result = await db.query(query, [userid, friendId, friendId, userid]);

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = blockUserService;
