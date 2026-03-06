const db = require("../../../db/database");

const deleteCommentService = async (commentId) => {
    try {
        const query = `DELETE FROM comments WHERE id = ?`;
        const result = await db.query(query, [commentId]);
        return result;
    } catch (error) {
        throw error;
    }
};
module.exports = deleteCommentService;