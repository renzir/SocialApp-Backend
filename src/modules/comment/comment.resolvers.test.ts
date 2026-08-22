import { beforeEach, describe, expect, it, vi } from "vitest";
import { commentResolvers } from "./comment.resolvers";
import { commentService } from "./CommentService";

// Mockear CommentService ya que testamos el resolver, no el service
vi.mock("./CommentService", () => ({
  commentService: {
    createComment: vi.fn(),
    getComments: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

describe("commentResolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Query", () => {
    it("debe obtener los comentarios de un post", async () => {
      const mockComments = [
        {
          id: 1,
          post_id: 10,
          user_id: 2,
          content: "Hola",
          created_at: "2026-01-01T00:00:00Z",
        },
      ];
      vi.mocked(commentService.getComments).mockResolvedValue(
        mockComments as any,
      );

      const result = await commentResolvers.Query.getComments(null, {
        postId: "10",
      });

      expect(commentService.getComments).toHaveBeenCalledWith(
        10,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockComments);
    });
  });

  describe("Mutation", () => {
    it("debe lanzar un error si el usuario no está autenticado al crear un comentario", async () => {
      const context = { user: null };
      const args = { postId: "10", content: "Nuevo comentario" };

      await expect(
        commentResolvers.Mutation.createComment(null, args, context as any),
      ).rejects.toThrow();
    });

    it("debe crear un comentario si el usuario está autenticado", async () => {
      const mockUser = { id: 2 };
      const context = { user: mockUser };
      const args = { postId: "10", content: "Nuevo comentario" };
      const mockCreatedComment = {
        id: 1,
        post_id: 10,
        user_id: 2,
        content: "Nuevo comentario",
        created_at: "2026-01-01T00:00:00Z",
      };

      vi.mocked(commentService.createComment).mockResolvedValue(
        mockCreatedComment as any,
      );

      const result = await commentResolvers.Mutation.createComment(
        null,
        args,
        context as any,
      );

      expect(commentService.createComment).toHaveBeenCalledWith(
        2,
        10,
        "Nuevo comentario",
      );
      expect(result).toEqual(mockCreatedComment);

      // Nota: Verificar el evento de PubSub requiere inyectar el pubsub o mockearlo completamente.
      // En proyectos reales suele inyectarse o ser una variable global singleton.
      // Aquí nos aseguramos de que el flujo funcione correctamente hasta el retorno.
    });
  });
});
