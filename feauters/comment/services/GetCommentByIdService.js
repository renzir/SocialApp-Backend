const db = require("../../../db/database");

const getCommentByIdService = async (commentId) => {
   
        const query = `SELECT * FROM comments WHERE id = ?`;
        const [rows] = await db.query(query, [commentId]);
        return rows[0];

};
module.exports = getCommentByIdService;