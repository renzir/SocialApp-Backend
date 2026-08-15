const db = require("../../../db/database");

const ModifyPostService = async (postId, content, newImagesUrls = []) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const updatePostQuery = `UPDATE posts SET content = ? WHERE id = ?`;
    await connection.query(updatePostQuery, [content, postId]);

    if (newImagesUrls && newImagesUrls.length > 0) {
      const deleteImagesQuery = `DELETE FROM post_images WHERE post_id = ?`;
      await connection.query(deleteImagesQuery, [postId]);

      const imageValues = newImagesUrls.map((url) => [postId, url]);
      const insertImagesQuery = `INSERT INTO post_images (post_id, image_url) VALUES ?`;
      await connection.query(insertImagesQuery, [imageValues]);
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
module.exports = ModifyPostService;
