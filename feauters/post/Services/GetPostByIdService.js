const db = require("../../../db/database");

const getPostByIdService = async (postId) => {
  try {
    const query = `
      SELECT *
      FROM posts
      WHERE id = ?
    `;
    const [rows] = await db.query(query, [postId]);  
    return rows[0]; 
  } catch (error) {
    throw error;
  }
};

module.exports = getPostByIdService;