const db = require("../../../db/database");

const getCommentByIdService = async (commentId) => {
    try {
        const query = `SELECT * FROM comments WHERE id = ?`;
        const [rows] = await db.query(query, [commentId]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};
module.exports = getCommentByIdService;