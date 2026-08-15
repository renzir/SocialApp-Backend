const db = require("../../../db/database");

const getStateByIDService = async (userid, friendId) => {
 
    const query = `
      SELECT * 
      FROM friendships 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
    `;

    const result = await db.query(query, [userid, friendId, friendId, userid]);

    const state = result[0][0];
    return state;

};

module.exports = getStateByIDService;
