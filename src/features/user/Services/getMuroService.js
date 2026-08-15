const db = require("../../../db/database.js");

const getMuroService = async (userId) => {
  const [rows] = await db.execute(
    `SELECT 
          p.id AS post_id,
          u.username AS autor, 
          p.content AS publicacion, 
          p.created_at AS fecha,
          GROUP_CONCAT(i.image_url) AS fotos
       FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN friendships f ON ((f.sender_id = p.user_id OR f.receiver_id = p.user_id) AND (f.sender_id = ? OR f.receiver_id = ?))
       LEFT JOIN post_images i ON p.id = i.post_id
       WHERE (f.sender_id = ? OR f.receiver_id = ?) 
         AND f.status = 'confirmed'
         AND p.user_id != ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
    [userId, userId, userId, userId, userId],
  );

  return rows.map((post) => ({
    ...post,
    fotos: post.fotos ? post.fotos.split(",") : [],
  }));
};

module.exports = getMuroService;
