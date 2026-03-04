// feauters/post/Services/DeletePostService.js
const db = require("../../../db/database");

const deletePostService = async (postId) => {
  try {
    const query = `
      DELETE FROM posts
      WHERE id = ?
    `;
    const result = await db.query(query, [postId]);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = deletePostService;