export const userQueries = {
  getUserById: `SELECT id, username, email_verified, profile_image_url, banner_image_url, bio, created_at FROM users WHERE id = ?`,

  checkUsernameUniqueExcludingUser: `SELECT id FROM users WHERE username = ? AND id != ?`,

  updateUserProfile: `
    UPDATE users SET 
       username = COALESCE(?, username), 
       bio = COALESCE(?, bio), 
       profile_image_url = COALESCE(?, profile_image_url), 
       banner_image_url = COALESCE(?, banner_image_url) 
     WHERE id = ?
  `,

  getFriendsList: `
    SELECT 
      CASE WHEN f.sender_id = ? THEN f.receiver_id ELSE f.sender_id END as friend_id,
      u.username, u.email_verified, u.profile_image_url, u.banner_image_url, u.bio, u.created_at
    FROM friendships f
    INNER JOIN users u ON (u.id = CASE WHEN f.sender_id = ? THEN f.receiver_id ELSE f.sender_id END)
    WHERE (f.sender_id = ? OR f.receiver_id = ?) 
      AND f.status = 'confirmed'
  `,

  getFriendRequests: `
    SELECT u.id, u.username, u.profile_image_url
    FROM friendships f
    INNER JOIN users u ON f.sender_id = u.id
    WHERE f.receiver_id = ? AND f.status = 'pending'
  `,

  deleteFriendshipBetweenUsers: `DELETE FROM friendships WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,

  insertOrUpdateBlock: `INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,

  deleteBlock: `DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?`,

  checkBlockStatus: `SELECT * FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)`,

  getSuggestedUsers: `
    SELECT u.id, u.username, u.profile_image_url, u.bio
    FROM users u
    WHERE u.id != ? 
      AND u.id NOT IN (
        SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as friend_id
        FROM friendships
        WHERE (sender_id = ? OR receiver_id = ?) AND status = 'confirmed'
      )
      AND u.id NOT IN (
        SELECT blocked_id FROM blocks WHERE blocker_id = ?
      )
      AND u.id NOT IN (
        SELECT sender_id FROM friendships WHERE receiver_id = ? AND status = 'pending'
      )
      AND u.id != ?
    LIMIT ?
  `,

  searchUsers: `
    SELECT id, username, profile_image_url, bio
    FROM users
    WHERE (username LIKE ? OR email LIKE ?) AND is_active = 1
    LIMIT ?
  `,
};

export default userQueries;
