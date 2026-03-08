const db = require("../../../db/database");

const AcceptFriendRequestService = async (userId, friendId) => {
  
    const result = await db.query(
      "UPDATE friendships SET status = 'confirmed' WHERE sender_id = ? AND receiver_id = ?",
      [ friendId , userId],
    );
    return result;

};

module.exports = AcceptFriendRequestService;    