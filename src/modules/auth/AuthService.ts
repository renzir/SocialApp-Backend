import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "../../db/database.js";
import { User } from "../../types/index.js";
import { loginSchema, registerSchema } from "../../types/zodSchemas.js";
import sendVerificationEmail from "./EmailService.js";
import { authQueries } from "./authQueries.js";
import { generateEmailVerifyToken } from "./emailToken.js";
import type { LoginPayload, RegisterPayload, TokenPair } from "./types.js";

const SALT_ROUNDS = 10;

export const authServices = {
  async register({
    username,
    email,
    password,
  }: RegisterPayload): Promise<User> {
    // Validar datos con Zod
    registerSchema.parse({ username, email, password });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [existingUser]: [any[], any] = await conn.execute(
        authQueries.checkUserExists,
        [username, email],
      );

      if (existingUser.length > 0) {
        throw new Error(
          "El nombre de usuario o el correo ya están registrados",
        );
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const [result]: [any, any] = await conn.execute(
        authQueries.insertNewUser,
        [username, hashedPassword, email],
      );

      const userId = result.insertId;

      await conn.commit();

      // Enviar email de verificación de forma asíncrona (sin bloquear si falla)
      try {
        const emailToken = generateEmailVerifyToken(userId);
        await sendVerificationEmail(email, emailToken);
      } catch (emailError) {
        console.error("Error enviando correo de verificación:", emailError);
      }

      return {
        id: userId,
        username,
        email,
        email_verified: false,
        is_active: true,
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async login({
    username,
    password,
  }: LoginPayload): Promise<{ user: User; tokens: TokenPair }> {
    // Validar datos con Zod
    loginSchema.parse({ username, password });

    const [rows]: [any[], any] = await pool.execute(
      authQueries.findUserForLogin,
      [username, username],
    );

    const user = rows[0];
    if (!user) throw new Error("Credenciales inválidas");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Credenciales inválidas");

    if (user.is_active === 0 || user.is_active === false) {
      throw new Error("Cuenta suspendida o inactiva");
    }

    // Omitir contraseña del objeto retornado
    const { password: _, ...safeUser } = user;

    const tokens = generateTokens(safeUser.id, safeUser.username);

    return { user: safeUser as User, tokens };
  },

  async findUserById(id: number): Promise<User | null> {
    const [rows]: [any[], any] = await pool.execute(authQueries.findUserById, [
      id,
    ]);

    return rows[0] || null;
  },

  async findUserByUsername(username: string): Promise<User | null> {
    const [rows]: [any[], any] = await pool.execute(
      authQueries.findUserByUsername,
      [username],
    );

    return rows[0] || null;
  },

  async verifyEmail(userId: number): Promise<boolean> {
    const [result]: [any, any] = await pool.execute(authQueries.verifyEmail, [
      userId,
    ]);
    return result.affectedRows > 0;
  },

  async verifyEmailToken(token: string): Promise<boolean> {
    const secret = process.env.EMAIL_VERIFY_SECRET;
    if (!secret) {
      throw new Error(
        "La variable de entorno EMAIL_VERIFY_SECRET no está definida",
      );
    }

    try {
      const decoded = jwt.verify(token, secret) as { userid: number };

      return await this.verifyEmail(decoded.userid);
    } catch (error) {
      throw new Error("El token de verificación es inválido o ha expirado");
    }
  },

  async refreshToken(oldRefreshToken: string): Promise<TokenPair> {
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshSecret) {
      throw new Error(
        "La variable de entorno REFRESH_TOKEN_SECRET no está definida",
      );
    }

    let decoded: { id: number; exp?: number };
    try {
      decoded = jwt.verify(oldRefreshToken, refreshSecret) as {
        id: number;
        exp?: number;
      };
    } catch (err) {
      throw new Error("Refresh token inválido o expirado");
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(oldRefreshToken)
      .digest("hex");

    // Verificar si el token ya fue revocado previamente
    const [revokedRows]: [any[], any] = await pool.execute(
      authQueries.isTokenRevoked,
      [tokenHash],
    );

    if (revokedRows.length > 0) {
      // Intento de reuso de token revocado (posible ataque/intercepción)
      throw new Error("Refresh token revocado. Inicie sesión nuevamente.");
    }

    // Obtener usuario para asegurarnos de que sigue activo
    const user = await this.findUserById(decoded.id);
    if (!user || user.is_active === false) {
      throw new Error("Usuario inactivo o no encontrado");
    }

    // Revocar el token actual (Rotation)
    const expiresAt = decoded.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.execute(authQueries.revokeRefreshToken, [tokenHash, expiresAt]);

    // Generar nuevos tokens
    const newTokens = generateTokens(user.id, user.username);
    return newTokens;
  },

  async revokeToken(refreshToken: string): Promise<void> {
    try {
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
      if (!refreshSecret) return;

      const decoded = jwt.decode(refreshToken) as { exp?: number } | null;
      const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      const expiresAt = decoded?.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await pool.execute(authQueries.revokeRefreshToken, [
        tokenHash,
        expiresAt,
      ]);
    } catch {
      // Ignorar errores al revocar en logout
    }
  },
};

function generateTokens(userId: number, username: string): TokenPair {
  const accessSecret = process.env.ACCESS_TOKEN_SECRET;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

  if (!accessSecret) {
    throw new Error(
      "La variable de entorno ACCESS_TOKEN_SECRET no está definida",
    );
  }

  if (!refreshSecret) {
    throw new Error(
      "La variable de entorno REFRESH_TOKEN_SECRET no está definida",
    );
  }

  return {
    accessToken: jwt.sign({ id: userId, username }, accessSecret, {
      expiresIn: "15m",
    }),
    refreshToken: jwt.sign({ id: userId }, refreshSecret, { expiresIn: "7d" }),
  };
}
