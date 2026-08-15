import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "El usuario o email es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const createPostSchema = z.object({
  descripcion: z
    .string()
    .max(1000, "El contenido no puede superar 1000 caracteres")
    .optional(),
});

export const createCommentSchema = z.object({
  comment: z
    .string()
    .min(1, "El comentario no puede estar vacío")
    .max(500, "Máximo 500 caracteres"),
  post_id: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
});
