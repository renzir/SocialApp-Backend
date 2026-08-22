import { z } from "zod";

// =============================================
// Autenticación
// =============================================

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50, "Máximo 50 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(255),
});

export const loginSchema = z.object({
  username: z.string().min(1, "El usuario o email es requerido"), // El backend puede decidir si busca por email o username
  password: z.string().min(1, "La contraseña es requerida"),
});

// =============================================
// Publicaciones (Posts)
// =============================================

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "El contenido no puede estar vacío")
    .max(1000, "El contenido no puede superar los 1000 caracteres"),
});

export const modifyPostSchema = createPostSchema.partial(); // Para modificar solo el contenido

// =============================================
// Comentarios
// =============================================

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "El comentario no puede estar vacío")
    .max(500, "Máximo 500 caracteres"),
  post_id: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]), // Acepta string o number
});

// =============================================
// Perfiles de Usuario
// =============================================

export const updateProfileSchema = z
  .object({
    username: z.string().min(3).max(50).optional(),
    bio: z.string().max(500).nullable().optional(),
    banner_image_url: z.string().url().nullable().optional(),
    profile_image_url: z.string().url().nullable().optional(),
  })
  .refine(
    (data) =>
      data.username ||
      data.bio ||
      data.banner_image_url ||
      data.profile_image_url,
    { message: "Debe proporcionar al menos un campo para actualizar" },
  );

export const emailVerificationSchema = z.object({
  token: z.string(),
});

// =============================================
// Amistades
// =============================================

export const sendFriendRequestSchema = z.object({
  receiver_id: z.union([
    z.number(),
    z.string().regex(/^\d+$/).transform(Number),
  ]),
});
