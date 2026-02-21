
const db = require("../../../db/database");

const SendFriendRequestController = async (userid, friendId ) => {
    try {

        const result = await db.query(
            "INSERT INTO friend_requests (sender_id, receiver_id) VALUES ($1, $2)",
            [userid, friendId]
        );
        return result;
    } catch (error) {
        throw error;
    }
};
