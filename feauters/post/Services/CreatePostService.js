const db = require("../../../db/database");

const createPostService = async (userId, content) => {
  try {
    const query = `
            INSERT INTO posts (user_id, content) 
            VALUES (?, ?)   
        `;

    const result = await db.query(query, [userId, content]);

    return result;
  } catch (error) {
    throw error; 
  }
};

module.exports = createPostService;
