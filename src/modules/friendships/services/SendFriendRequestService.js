const db = require("../../../db/database");

const SendFriendRequestService = async (userid, friendId) => {
  
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
        userid,                         
        friendId,                       
        existingRelationship.sender_id, 
        existingRelationship.receiver_id 
      ]);
      return result;

    } else {
     
      const insertQuery = `
        INSERT INTO friendships (sender_id, receiver_id, status) 
        VALUES (?, ?, 'pending')
      `;
      
      const result = await db.query(insertQuery, [userid, friendId]);
      return result;
    }


};

module.exports = SendFriendRequestService;
