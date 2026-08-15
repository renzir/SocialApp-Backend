const db = require("../../../db/database");

const getCommentsService = async (postId) => {
   
        const query = `
            SELECT 
                c.*, 
                u.username, 
                u.profile_image_url 
            FROM comments c
            INNER JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `;
        const [rows] = await db.query(query, [postId]);
        return rows;

};
module.exports = getCommentsService;