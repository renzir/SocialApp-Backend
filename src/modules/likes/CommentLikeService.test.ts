import { beforeEach, describe, expect, it, vi } from "vitest";
import pool from "../../db/database.js";
import { commentLikeService } from "./CommentLikeService.js";

vi.mock("../../db/database.js", () => ({
  default: {
    execute: vi.fn(),
    getConnection: vi.fn(),
  },
}));

describe("CommentLikeService", () => {
  let mockConn: {
    execute: ReturnType<typeof vi.fn>;
    beginTransaction: ReturnType<typeof vi.fn>;
    commit: ReturnType<typeof vi.fn>;
    rollback: ReturnType<typeof vi.fn>;
    release: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockConn = {
      execute: vi.fn(),
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
    };

    vi.mocked(pool.getConnection).mockResolvedValue(mockConn as any);
  });

  describe("addLikeComment", () => {
    it("debe agregar un like exitosamente", async () => {
      const mockConn = await pool.getConnection();

      vi.mocked(mockConn.execute).mockImplementation(
        (sql: any, _params?: any) => {
          const sqlStr = typeof sql === "string" ? sql.toLowerCase() : "";
          if (sqlStr.includes("select id from comment_likes")) {
            return Promise.resolve([[], {}] as any);
          }
          return Promise.resolve([[{}], {}] as any);
        },
      );

      const result = await commentLikeService.addLikeComment(1, 5);

      expect(result).toBe(true);
      expect(mockConn.beginTransaction).toHaveBeenCalled();
      expect(mockConn.commit).toHaveBeenCalled();
    });

    it("debe lanzar error si ya existe el like", async () => {
      const mockConn = await pool.getConnection();

      vi.mocked(mockConn.execute).mockImplementation((sql: any) => {
        const sqlStr = typeof sql === "string" ? sql.toLowerCase() : "";
        if (sqlStr.includes("select id from comment_likes")) {
          return Promise.resolve([[{ id: 1 }], {}] as any);
        }
        return Promise.resolve([[{}], {}] as any);
      });

      await expect(commentLikeService.addLikeComment(1, 5)).rejects.toThrow(
        "Ya te gusta este comentario",
      );
    });

    it("debe rollback en error", async () => {
      const mockConn = await pool.getConnection();

      vi.mocked(mockConn.beginTransaction).mockRejectedValue(
        new Error("DB Error"),
      );

      await expect(commentLikeService.addLikeComment(1, 5)).rejects.toThrow(
        "DB Error",
      );
      expect(mockConn.rollback).toHaveBeenCalled();
    });
  });

  describe("removeLikeComment", () => {
    it("debe eliminar un like exitosamente", async () => {
      const mockConn = await pool.getConnection();
      vi.mocked(mockConn.execute).mockImplementation((sql: any) => {
        const sqlStr = typeof sql === "string" ? sql.toLowerCase() : "";
        if (sqlStr.includes("delete")) {
          return Promise.resolve([{ affectedRows: 1 }, {}] as any);
        }
        if (sqlStr.includes("select")) {
          return Promise.resolve([[{ user_id: 2, post_id: 1 }], {}] as any);
        }
        return Promise.resolve([{}, {}] as any);
      });

      const result = await commentLikeService.removeLikeComment(1, 5);

      expect(result).toBe(true);
      expect(mockConn.beginTransaction).toHaveBeenCalled();
      expect(mockConn.commit).toHaveBeenCalled();
    });

    it("debe retornar false si no se encontró el like", async () => {
      const mockConn = await pool.getConnection();
      vi.mocked(mockConn.execute).mockResolvedValue([
        { affectedRows: 0 },
        {},
      ] as any);

      const result = await commentLikeService.removeLikeComment(1, 5);

      expect(result).toBe(false);
      expect(mockConn.commit).toHaveBeenCalled();
    });
  });

  describe("getLikeCount", () => {
    it("debe retornar la cantidad de likes", async () => {
      vi.mocked(pool.execute).mockResolvedValue([
        [{ like_count: 42 }],
        {},
      ] as any);
      const result = await commentLikeService.getLikeCount(1);

      expect(result).toBe(42);
    });
    it("debe retornar 0 si no hay likes", async () => {
      vi.mocked(pool.execute).mockResolvedValue([
        [{ like_count: 0 }],
        {},
      ] as any);

      const result = await commentLikeService.getLikeCount(999);

      expect(result).toBe(0);
    });
  });

  describe("hasLiked", () => {
    it("debe retornar true si ya dio like", async () => {
      vi.mocked(pool.execute).mockResolvedValue([[{ id: 1 }], {}] as any);

      const result = await commentLikeService.hasLiked(1, 5);

      expect(result).toBe(true);
    });

    it("debe retornar false si no dio like", async () => {
      vi.mocked(pool.execute).mockResolvedValue([[], {}] as any);

      const result = await commentLikeService.hasLiked(1, 5);

      expect(result).toBe(false);
    });
  });
});
