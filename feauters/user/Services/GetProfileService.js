const db = require("../../../db/database");

const getProfileService = async (userId) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
        id, 
        username, 
        email, 
        profile_image_url, 
        email_verified 
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return null; 
    }

    return rows[0]; 
  } catch (error) {
    console.error("Error en GetProfileService:", error);
    throw error;
  }
};

module.exports = getProfileService;