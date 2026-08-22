import { beforeEach, describe, expect, it, vi } from "vitest";
import db from "../../db/database";
import { commentService } from "./CommentService";

// Mockear la base de datos para no golpearla en las pruebas unitarias
vi.mock("../../db/database", () => ({
  default: {
    execute: vi.fn(),
  },
}));

describe("CommentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createComment", () => {
    it("debe crear un comentario exitosamente", async () => {
      const userId = 2;
      const postId = 10;
      const content = "Hola mundo!";

      const mockCreatedComment = {
        id: 1,
        post_id: postId,
        user_id: userId,
        content,
        username: "user_test",
        perfil_imagen: null,
        created_at: new Date(),
      };

      // 1. Inserción (INSERT INTO comments...)
      // 2. Consulta del comentario creado (SELECT c.*, u.username...)
      vi.mocked(db.execute)
        .mockResolvedValueOnce([{ affectedRows: 1, insertId: 1 } as any, []])
        .mockResolvedValueOnce([[mockCreatedComment] as any, []]);

      const result = await commentService.createComment(
        userId,
        postId,
        content,
      );
      expect(db.execute).toHaveBeenNthCalledWith(
        1,
        "INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)",
        [userId, postId, content],
      );

      expect(result).toHaveProperty("id", 1);
      expect(result.content).toBe(content);
    });

    it("debe lanzar un error si falla la inserción", async () => {
      vi.mocked(db.execute).mockRejectedValue(new Error("DB Error"));

      await expect(
        commentService.createComment(2, 10, "Hola mundo!"),
      ).rejects.toThrow();
    });
  });

  describe("getComments", () => {
    it("debe retornar la lista de comentarios para un post", async () => {
      const mockRows = [
        {
          id: 1,
          post_id: 10,
          user_id: 2,
          content: "Comentario 1",
          created_at: new Date(),
        },
      ];
      vi.mocked(db.execute).mockResolvedValue([mockRows as any, []]);

      const result = await commentService.getComments(10);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [10, 20, 0],
      );
      expect(result).toEqual(mockRows);
    });
  });

  describe("deleteComment", () => {
    it("debe eliminar un comentario si el usuario es el dueño", async () => {
      const commentId = 1;
      const userId = 2;

      // 1. Verificación de permisos (SELECT user_id FROM comments...)
      // 2. Eliminación (DELETE FROM comments...)
      vi.mocked(db.execute)
        .mockResolvedValueOnce([[{ user_id: userId }] as any, []])
        .mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

      const result = await commentService.deleteComment(commentId, userId);

      expect(db.execute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("DELETE FROM comments"),
        [commentId],
      );
      expect(result).toBe(true);
    });
  });
});
