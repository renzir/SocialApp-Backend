const db = require("../../../db/database");

const getAllPostsService = async () => {
  try {
    const query = `
      SELECT *
      FROM posts
      ORDER BY created_at DESC  -- Opcional: Ordenar por fecha
    `;
    const [rows] = await db.query(query);  
    return rows; 
  } catch (error) {
    throw error;
  }
};

module.exports = getAllPostsService;