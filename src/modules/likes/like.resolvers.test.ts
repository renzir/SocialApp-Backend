import { beforeEach, describe, expect, it, vi } from "vitest";
import { likeResolvers } from "./like.resolvers.js";
import { postLikeService } from "./PostLikeService.js";
import { commentLikeService } from "./CommentLikeService.js";

vi.mock("./PostLikeService.js", () => ({
  postLikeService: {
    addLikePost: vi.fn(),
    removeLikePost: vi.fn(),
    getLikeCount: vi.fn(),
    hasLiked: vi.fn(),
  },
}));

vi.mock("./CommentLikeService.js", () => ({
  commentLikeService: {
    addLikeComment: vi.fn(),
    removeLikeComment: vi.fn(),
    getLikeCount: vi.fn(),
    hasLiked: vi.fn(),
  },
}));

describe("likeResolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addLikePost", () => {
    it("debe lanzar error si no está autenticado", async () => {
      await expect(
        likeResolvers.Mutation.addLikePost(
          {},
          { postId: "1" },
          { user: null } as any,
        ),
      ).rejects.toThrow("No estás autenticado");
    });

    it("debe lanzar error si postId es inválido", async () => {
      await expect(
        likeResolvers.Mutation.addLikePost(
          {},
          { postId: "abc" },
          { user: { id: 5 } } as any,
        ),
      ).rejects.toThrow("ID de publicación inválido");
    });

    it("debe agregar like y retornar success si todo es correcto", async () => {
      vi.mocked(postLikeService.addLikePost).mockResolvedValue(true);

      const result = await likeResolvers.Mutation.addLikePost(
        {},
        { postId: "10" },
        { user: { id: 5 } } as any,
      );

      expect(postLikeService.addLikePost).toHaveBeenCalledWith(10, 5);
      expect(result).toEqual({
        success: true,
        message: "Publicación marcada como favorita",
      });
    });
  });

  describe("removeLikePost", () => {
    it("debe lanzar error si no está autenticado", async () => {
      await expect(
        likeResolvers.Mutation.removeLikePost(
          {},
          { postId: "1" },
          { user: null } as any,
        ),
      ).rejects.toThrow("No estás autenticado");
    });

    it("debe lanzar error si postId es inválido", async () => {
      await expect(
        likeResolvers.Mutation.removeLikePost(
          {},
          { postId: "xyz" },
          { user: { id: 5 } } as any,
        ),
      ).rejects.toThrow("ID de publicación inválido");
    });

    it("debe quitar like y retornar success si todo es correcto", async () => {
      vi.mocked(postLikeService.removeLikePost).mockResolvedValue(true);

      const result = await likeResolvers.Mutation.removeLikePost(
        {},
        { postId: "10" },
        { user: { id: 5 } } as any,
      );

      expect(postLikeService.removeLikePost).toHaveBeenCalledWith(10, 5);
      expect(result).toEqual({
        success: true,
        message: "Quitar favorito de la publicación",
      });
    });
  });

  describe("addLikeComment", () => {
    it("debe lanzar error si no está autenticado", async () => {
      await expect(
        likeResolvers.Mutation.addLikeComment(
          {},
          { commentId: "1" },
          { user: null } as any,
        ),
      ).rejects.toThrow("No estás autenticado");
    });

    it("debe lanzar error si commentId es inválido", async () => {
      await expect(
        likeResolvers.Mutation.addLikeComment(
          {},
          { commentId: "abc" },
          { user: { id: 5 } } as any,
        ),
      ).rejects.toThrow("ID de comentario inválido");
    });

    it("debe agregar like y retornar success si todo es correcto", async () => {
      vi.mocked(commentLikeService.addLikeComment).mockResolvedValue(true);

      const result = await likeResolvers.Mutation.addLikeComment(
        {},
        { commentId: "10" },
        { user: { id: 5 } } as any,
      );

      expect(commentLikeService.addLikeComment).toHaveBeenCalledWith(10, 5);
      expect(result).toEqual({
        success: true,
        message: "Comentario marcado como favorito",
      });
    });
  });

  describe("removeLikeComment", () => {
    it("debe lanzar error si no está autenticado", async () => {
      await expect(
        likeResolvers.Mutation.removeLikeComment(
          {},
          { commentId: "1" },
          { user: null } as any,
        ),
      ).rejects.toThrow("No estás autenticado");
    });

    it("debe lanzar error si commentId es inválido", async () => {
      await expect(
        likeResolvers.Mutation.removeLikeComment(
          {},
          { commentId: "xyz" },
          { user: { id: 5 } } as any,
        ),
      ).rejects.toThrow("ID de comentario inválido");
    });

    it("debe quitar like y retornar success si todo es correcto", async () => {
      vi.mocked(commentLikeService.removeLikeComment).mockResolvedValue(true);

      const result = await likeResolvers.Mutation.removeLikeComment(
        {},
        { commentId: "10" },
        { user: { id: 5 } } as any,
      );

      expect(commentLikeService.removeLikeComment).toHaveBeenCalledWith(10, 5);
      expect(result).toEqual({
        success: true,
        message: "Quitar favorito del comentario",
      });
    });
  });
});