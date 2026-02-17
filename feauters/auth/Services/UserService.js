
const db = require("../../../db/database.js"); 

async function createUser(username, passHash, email) {
  try {
    const [result] = await db.execute(
      "INSERT INTO prueba_db.users (username, password, email) VALUES(?,?,?)",
      [username, passHash, email],
    );
    return result;
  } catch (error) {
    console.error("Error en createUser:", error);
    throw error; 
  }
}

async function findUserByUsername(username) {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM prueba_db.users WHERE username = ?",
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
    const [rows] = await db.execute(
      "SELECT * FROM prueba_db.users WHERE email = ?",
      [email],
    );
    return rows[0];
  } catch (error) {
    console.error("Error en findUserByEmail:", error);
    throw error;
  }
}

async function verifyEmail(userId) {
  try {
    const [result] = await db.execute(
      "UPDATE prueba_db.users SET email_verified = 1 where id = ?",
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
};
