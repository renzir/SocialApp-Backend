const db = require("../../../db/database");
const fs = require("fs");
const path = require("path");

const deletePostService = async (postId) => {
  try {
    const imagesQuery = `SELECT image_url FROM post_images WHERE post_id = ?`;
    const [images] = await db.query(imagesQuery, [postId]);

    if (images && images.length > 0) {
      images.forEach((img) => {
        const filePath = path.resolve(img.image_url);

        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(filePath, (err) => {
              if (err)
                console.error(`Error al borrar archivo ${filePath}:`, err);
            });
          }
        });
      });
    }

    const deleteQuery = `DELETE FROM posts WHERE id = ?`;
    const result = await db.query(deleteQuery, [postId]);

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = deletePostService;
