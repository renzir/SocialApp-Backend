const db = require("../../../db/database");

const createCommentService = async (userId, postId, content) => {
    try {
        const query = `INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)`;
        const result = await db.query(query, [userId, postId, content]);
        return result;
    } catch (error) {
        throw error;
    }
};
module.exports = createCommentService;

