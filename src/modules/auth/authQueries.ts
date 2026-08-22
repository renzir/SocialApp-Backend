// Backend/src/modules/auth/authQueries.ts

/**
 * Queries SQL centralizados para el módulo de autenticación.
 * Esto mejora la legibilidad y mantenibilidad del código,
 * evitando que las sentencias SQL estén esparcidas por el servicio.
 */

export const authQueries = {
  /**
   * Verifica si un usuario existe por username o email
   */
  checkUserExists: `
    SELECT id 
    FROM users 
    WHERE username = ? OR email = ?
  `,

  /**
   * Inserta un nuevo usuario en la base de datos
   */
  insertNewUser: `
    INSERT INTO users (username, password, email) 
    VALUES (?, ?, ?)
  `,

  /**
   * Obtiene todos los datos del usuario por su ID
   */
  findUserById: `
    SELECT 
      id, 
      username, 
      email, 
      profile_image_url, 
      banner_image_url, 
      bio, 
      is_active, 
      email_verified, 
      created_at 
    FROM users 
    WHERE id = ?
  `,

  /**
   * Obtiene todos los datos del usuario por su username
   */
  findUserByUsername: `
    SELECT 
      id, 
      username, 
      email, 
      profile_image_url, 
      banner_image_url, 
      bio, 
      is_active, 
      email_verified, 
      created_at 
    FROM users 
    WHERE username = ?
  `,

  /**
   * Obtiene usuario para login (incluye password hash)
   */
  findUserForLogin: `
    SELECT id, username, password, email, is_active, email_verified 
    FROM users 
    WHERE username = ? OR email = ?
  `,

  /**
   * Verifica el correo electrónico del usuario
   */
  verifyEmail: `
    UPDATE users 
    SET email_verified = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND email_verified = false
  `,

  /**
   * Revoca un refresh token guardando su hash en la base de datos
   */
  revokeRefreshToken: `
    INSERT INTO revoked_tokens (token_hash, expires_at)
    VALUES (?, ?)
  `,

  /**
   * Consulta si un token ya está en la lista de revocados
   */
  isTokenRevoked: `
    SELECT id FROM revoked_tokens WHERE token_hash = ?
  `,

  /**
   * Limpia los tokens revocados que ya expiraron
   */
  cleanExpiredRevokedTokens: `
    DELETE FROM revoked_tokens WHERE expires_at < CURRENT_TIMESTAMP
  `,
};

export default authQueries;
