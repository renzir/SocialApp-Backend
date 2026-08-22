export const notificationQueries = {
  insertNotification: `
    INSERT INTO notifications (user_id, type, sender_id, post_id, comment_id) 
    VALUES (?, ?, ?, ?, ?)
  `,

  getUserNotifications: `
    SELECT 
      n.id,
      n.type,
      n.is_read,
      n.created_at,
      n.sender_id,
      n.post_id,
      n.comment_id,
      s.username as sender_username,
      s.profile_image_url as sender_profile_image
    FROM notifications n
    INNER JOIN users s ON n.sender_id = s.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
  `,

  getUserUnreadNotificationsCount: `
    SELECT COUNT(*) as count 
    FROM notifications 
    WHERE user_id = ? AND is_read = 0
  `,

  markAsRead: `
    UPDATE notifications 
    SET is_read = 1 
    WHERE id = ? AND user_id = ?
  `,

  markAllAsRead: `
    UPDATE notifications 
    SET is_read = 1 
    WHERE user_id = ? AND is_read = 0
  `,

  deleteNotification: `
    DELETE FROM notifications
    WHERE user_id = ? AND type = ? AND sender_id = ?
    AND (post_id = ? OR (post_id IS NULL AND ? IS NULL))
    AND (comment_id = ? OR (comment_id IS NULL AND ? IS NULL))
  `,

  getNotificationById: `
    SELECT
      n.*,
      s.username as sender_username,
      s.profile_image_url as sender_profile_image
    FROM notifications n
    INNER JOIN users s ON n.sender_id = s.id
    WHERE n.id = ? AND n.user_id = ?
  `,
};

export default notificationQueries;
