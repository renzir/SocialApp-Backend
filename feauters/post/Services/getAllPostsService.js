const db = require("../../../db/database");

const getAllPostsService = async () => {
  try {
    const query = `
      SELECT
        p.*,
        GROUP_CONCAT(pi.image_url) as images
      FROM posts p
      LEFT JOIN post_images pi ON p.id = pi.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(query);

    const posts = rows.map((post) => {
      if (post.images) {
        post.images = post.images.split(",");
      } else {
        post.images = [];
      }
      return post;
    });

    return posts;
  } catch (error) {
    throw error;
  }
};

module.exports = getAllPostsService;
