export const commentLikeQueries = {
  insertCommentLike: `INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)`,

  deleteCommentLike: `DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?`,

  checkCommentLikeExists: `
    SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?
  `,

  getCommentLikeCountByCommentId: `
    SELECT COUNT(*) as like_count FROM comment_likes WHERE comment_id = ?
  `,

  getCommentLikeByCommentIdAndUserId: `
    SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?
  `,
};

export default commentLikeQueries;