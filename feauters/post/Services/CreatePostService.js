const db = require("../../../db/database");

const createPostService = async (userId, content, imagesUrls = []) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const postQuery = `INSERT INTO posts (user_id, content) VALUES (?, ?)`;
    const [postResult] = await connection.query(postQuery, [userId, content]);
    const newPostId = postResult.insertId;

    if (imagesUrls && imagesUrls.length > 0) {
      const imageValues = imagesUrls.map((url) => [newPostId, url]);
      const imagesQuery = `INSERT INTO post_images (post_id, image_url) VALUES ?`;
      await connection.query(imagesQuery, [imageValues]);
    }

    await connection.commit();

    return { insertId: newPostId, affectedRows: postResult.affectedRows };
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = createPostService;
