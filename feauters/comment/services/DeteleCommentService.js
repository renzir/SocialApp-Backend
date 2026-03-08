const db = require("../../../db/database");

const deleteCommentService = async (commentId) => {
   
        const query = `DELETE FROM comments WHERE id = ?`;
        const result = await db.query(query, [commentId]);
        return result;

};
module.exports = deleteCommentService;