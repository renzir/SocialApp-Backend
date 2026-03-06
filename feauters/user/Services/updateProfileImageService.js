const db = require("../../../db/database.js");

const updateProfileImageService = async (userId, imageUrl) => {
  try {
    const query = `
      UPDATE users
      SET profile_image_url = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [imageUrl, userId]);
    return result;
  } catch (error) {
    console.error("Error en updateProfileImageService:", error);
    throw error;
  }
};

module.exports = updateProfileImageService;