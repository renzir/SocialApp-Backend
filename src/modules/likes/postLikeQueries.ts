export const postLikeQueries = {
  insertPostLike: `INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)`,

  deletePostLike: `DELETE FROM post_likes WHERE post_id = ? AND user_id = ?`,

  checkPostLikeExists: `
    SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?
  `,

  getPostLikeCountByPostId: `
    SELECT COUNT(*) as like_count FROM post_likes WHERE post_id = ?
  `,

  getPostLikeByPostIdAndUserId: `
    SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?
  `,
};

export default postLikeQueries;