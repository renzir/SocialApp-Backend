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
      return null; // El usuario no existe
    }

    return rows[0]; // Retornamos el primer (y único) resultado
  } catch (error) {
    console.error("Error en GetProfileService:", error);
    throw error;
  }
};

module.exports = getProfileService;