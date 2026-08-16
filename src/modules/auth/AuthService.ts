import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../db/database.js";
import { User } from "../../types/index.js";
import { loginSchema, registerSchema } from "../../types/zodSchemas.js";
import { generateEmailVerifyToken } from "./emailToken.js";
import sendVerificationEmail from "./EmailService.js";

interface LoginPayload {
  username: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

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
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email],
      );

      if (existingUser.length > 0) {
        throw new Error(
          "El nombre de usuario o el correo ya están registrados",
        );
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const [result]: [any, any] = await conn.execute(
        "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
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
      "SELECT * FROM users WHERE username = ? OR email = ?",
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
    const [rows]: [any[], any] = await pool.execute(
      "SELECT id, username, email, profile_image_url, banner_image_url, bio, is_active, email_verified, created_at FROM users WHERE id = ?",
      [id],
    );

    return rows[0] || null;
  },

  async findUserByUsername(username: string): Promise<User | null> {
    const [rows]: [any[], any] = await pool.execute(
      "SELECT id, username, email, profile_image_url, banner_image_url, bio, is_active, email_verified, created_at FROM users WHERE username = ?",
      [username],
    );

    return rows[0] || null;
  },

  async verifyEmail(userId: number): Promise<boolean> {
    const [result]: [any, any] = await pool.execute(
      "UPDATE users SET email_verified = true WHERE id = ?",
      [userId],
    );
    return result.affectedRows > 0;
  },

  async verifyEmailToken(token: string): Promise<boolean> {
    try {
      const secret = process.env.EMAIL_VERIFY_SECRET || "default_verify_secret";
      const decoded = jwt.verify(token, secret) as { userid: number };

      return await this.verifyEmail(decoded.userid);
    } catch (error) {
      throw new Error("El token de verificación es inválido o ha expirado");
    }
  },
};

function generateTokens(userId: number, username: string): TokenPair {
  const accessSecret = process.env.ACCESS_TOKEN_SECRET || "default_access";
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || "default_refresh";

  return {
    accessToken: jwt.sign({ id: userId, username }, accessSecret, {
      expiresIn: "15m",
    }),
    refreshToken: jwt.sign({ id: userId }, refreshSecret, { expiresIn: "7d" }),
  };
}
