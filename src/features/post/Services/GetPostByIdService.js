const db = require("../../../db/database");

const getPostByIdService = async (postId) => {
  try {
    const query = `
      SELECT
        p.*,
        GROUP_CONCAT(pi.image_url) as images
      FROM posts p
      LEFT JOIN post_images pi ON p.id = pi.post_id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    const [rows] = await db.query(query, [postId]);

    if (!rows[0]) return null;
    const post = rows[0];

    if (post.images) {
      post.images = post.images.split(",");
    } else {
      post.images = [];
    }

    return post;
  } catch (error) {
    throw error;
  }
};

module.exports = getPostByIdService;
