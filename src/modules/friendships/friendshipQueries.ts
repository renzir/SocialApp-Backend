export const friendshipQueries = {
  checkExistingFriendship: `
    SELECT sender_id, receiver_id, status
    FROM friendships 
    WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?)
  `,

  updateFriendshipToPending: `
    UPDATE friendships 
    SET sender_id = ?, receiver_id = ?, status = 'pending', updated_at = NOW()
    WHERE sender_id = ? AND receiver_id = ?
  `,

  insertFriendshipPending: `
    INSERT INTO friendships (sender_id, receiver_id, status) 
    VALUES (?, ?, 'pending')
  `,

  acceptFriendRequest: `
    UPDATE friendships 
    SET status = 'confirmed', updated_at = NOW() 
    WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'
  `,

  cancelFriendRequest: `
    DELETE FROM friendships 
    WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
      AND status = 'pending'
  `,

  getFriendshipStatus: `
    SELECT status, sender_id, receiver_id
    FROM friendships
    WHERE (sender_id = ? AND receiver_id = ?)
       OR (sender_id = ? AND receiver_id = ?)
  `,

  getFriendshipById: `
    SELECT sender_id, receiver_id
    FROM friendships
    WHERE id = ? AND status = 'pending'
  `,
};

export default friendshipQueries;

