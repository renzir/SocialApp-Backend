const db = require("../../../db/database");

const SendFriendRequestService = async (userid, friendId) => {
  try {
    const checkQuery = `
      SELECT sender_id, receiver_id
      FROM friendships 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
    `;
    
    const checkResult = await db.query(checkQuery, [userid, friendId, friendId, userid]);
    
    const existingRelationship = checkResult[0] && checkResult[0][0];

    if (existingRelationship) {
 
      const updateQuery = `
        UPDATE friendships 
        SET sender_id = ?, receiver_id = ?, status = 'pending', updated_at = NOW()
        WHERE sender_id = ? AND receiver_id = ?
      `;
      
      const result = await db.query(updateQuery, [
        userid,                         // Nuevo sender (TÚ)
        friendId,                       // Nuevo receiver (ÉL)
        existingRelationship.sender_id, // Antiguo sender (para el WHERE)
        existingRelationship.receiver_id // Antiguo receiver (para el WHERE)
      ]);
      return result;

    } else {
      // 3. Si no existe, INSERTAMOS una nueva
      const insertQuery = `
        INSERT INTO friendships (sender_id, receiver_id, status) 
        VALUES (?, ?, 'pending')
      `;
      
      const result = await db.query(insertQuery, [userid, friendId]);
      return result;
    }

  } catch (error) {
    throw error;
  }
};

module.exports = SendFriendRequestService;
