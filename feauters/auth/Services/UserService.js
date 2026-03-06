const db = require("../../../db/database.js");

async function createUser(username, passHash, email) {
  try {
    // Le saqué el "prueba_db." para que use la DB que configuraste en la conexión.
    const [result] = await db.execute(
      "INSERT INTO users (username, password, email) VALUES(?,?,?)",
      [username, passHash, email],
    );
    return result;
  } catch (error) {
    console.error("Error en createUser:", error);
    throw error;
  }
}
async function findUserForLogin(username) {
  try {
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
  } catch (error) {
    throw error;
  }
}

async function findUserByUsername(username) {
  try {
    const [rows] = await db.execute(
      "SELECT id, username, email, email_verified FROM users WHERE username = ?",
      [username],
    );
    return rows[0];
  } catch (error) {
    console.error("Error en findUserByUsername:", error);
    throw error;
  }
}

async function findUserByEmail(email) {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  } catch (error) {
    console.error("Error en findUserByEmail:", error);
    throw error;
  }
}

async function verifyEmail(userId) {
  try {
    const [result] = await db.execute(
      "UPDATE users SET email_verified = 1 where id = ?",
      [userId],
    );
    return result;
  } catch (error) {
    console.error("Error en verifyEmail:", error);
    throw error;
  }
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserByEmail,
  verifyEmail,
  findUserForLogin,
};
