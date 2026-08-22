export const commentQueries = {
  insertComment: `INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)`,

  findCommentWithUserById: `
    SELECT c.*, u.username, u.profile_image_url as perfil_imagen
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `,

  getCommentsByPostId: `
    SELECT 
      c.id,
      c.post_id,
      c.user_id,
      c.content,
      c.created_at,
      c.updated_at,
      u.username, 
      u.profile_image_url as perfil_imagen
    FROM comments c
    INNER JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `,

  findCommentUserIdById: `SELECT user_id FROM comments WHERE id = ?`,

  deleteCommentById: `DELETE FROM comments WHERE id = ?`,
};

export default commentQueries;
