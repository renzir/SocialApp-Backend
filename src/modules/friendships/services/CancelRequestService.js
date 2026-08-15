const db = require("../../../db/database");

const CancelRequestService = async (userid, friendId) => {


    const query = `
      UPDATE friendships 
      SET status = 'cancelled' 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
    `;

    const result = await db.query(query, [userid, friendId, friendId, userid]);
    
    return result;

};

module.exports = CancelRequestService;