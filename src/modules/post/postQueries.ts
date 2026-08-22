export const postQueries = {
  insertPost: `INSERT INTO posts (user_id, content) VALUES (?, ?)`,

  insertPostImage: `INSERT INTO post_images (post_id, image_url, order_index) VALUES (?, ?, ?)`,

  findUserPostHeaderById: `SELECT username, profile_image_url FROM users WHERE id = ?`,

  getPostById: `
    SELECT 
      p.id,
      p.user_id,
      p.content,
      p.created_at,
      p.updated_at,
      u.username as autor,
      u.profile_image_url as imagen_perfil,
      pi.id as image_id,
      pi.image_url,
      pi.order_index,
      pi.created_at as image_created_at
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN post_images pi ON p.id = pi.post_id
    WHERE p.id = ?
  `,

  getAllPosts: `
    SELECT 
      p.id,
      p.user_id,
      p.content,
      p.created_at,
      p.updated_at,
      u.username as autor,
      u.profile_image_url as imagen_perfil,
      pi.id as image_id,
      pi.image_url,
      pi.order_index,
      pi.created_at as image_created_at
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN post_images pi ON p.id = pi.post_id
    ORDER BY p.created_at DESC
  `,

  checkPostUserId: `SELECT user_id FROM posts WHERE id = ?`,

  updatePostContent: `UPDATE posts SET content = ?, updated_at = NOW() WHERE id = ?`,

  deletePostImagesByPostId: `DELETE FROM post_images WHERE post_id = ?`,

  getPostImageUrlsByPostId: `SELECT image_url FROM post_images WHERE post_id = ?`,

  deletePostById: `DELETE FROM posts WHERE id = ?`,
};

export default postQueries;
