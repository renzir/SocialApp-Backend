const db = require("../../../db/database.js");

const getListFriendsService = async (id) => {
  const [rows] = await db.execute(
    `SELECT 
        u.id AS friend_id,
        u.username AS friend_name,
        f.created_at
      FROM friendships f
      JOIN users u ON 
        CASE 
          WHEN f.sender_id = ? THEN u.id = f.receiver_id
          WHEN f.receiver_id = ? THEN u.id = f.sender_id
        END
      WHERE (f.sender_id = ? OR f.receiver_id = ?)
        AND f.status = 'confirmed'`,
    [id, id, id, id],
  );

  return rows;
};
module.exports = getListFriendsService;
