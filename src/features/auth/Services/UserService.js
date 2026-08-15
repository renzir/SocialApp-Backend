const db = require("../../../db/database.js");
const logger = require("../../../config/logger.js");

async function createUser(username, passHash, email) {
  const [result] = await db.execute(
    "INSERT INTO users (username, password, email) VALUES(?,?,?)",
    [username, passHash, email],
  );
  return result;
}

async function findUserForLogin(username) {
  const query = `
      SELECT 
        id, 
        username, 
        password, 
        email, 
        email_verified,
        is_active
      FROM users 
      WHERE username = ?
    `;
  const [rows] = await db.execute(query, [username]);
  return rows[0];
}

async function findUserByUsername(username) {
  const [rows] = await db.execute(
    "SELECT id, username, email, email_verified FROM users WHERE username = ?",
    [username],
  );
  return rows[0];
}

async function findUserByEmail(email) {
  const [rows] = await db.execute(
    "SELECT id, username, email, email_verified FROM users WHERE email = ?",
    [email],
  );
  return rows[0];
}

async function verifyEmail(userId) {
  const [result] = await db.execute(
    "UPDATE users SET email_verified = 1 where id = ?",
    [userId],
  );
  return result;
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserByEmail,
  verifyEmail,
  findUserForLogin,
};
