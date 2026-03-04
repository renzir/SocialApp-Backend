
const db = require("../../../db/database");

const ModifyPostService = async (postId, content) => {
    try {
        const query = `
            UPDATE posts
            SET content = ?
            WHERE id = ?
        `;
        const result = await db.query(query, [content, postId]);
        return result;
    } catch (error) {
        throw error;

    }
}
module.exports = ModifyPostService;
