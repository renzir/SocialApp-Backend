const db = require("../../../db/database.js");

const updateProfileImageService = async (userId, imageUrl) => {
  
    const query = `
      UPDATE users
      SET profile_image_url = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [imageUrl, userId]);
    return result;

};

module.exports = updateProfileImageService;