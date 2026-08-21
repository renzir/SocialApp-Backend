// Backend/src/modules/post/PostService.test.ts
import fs from "fs";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import pool from "../../db/database.js";
import { postService } from "./PostService.js";

// Define interface for the mock connection to satisfy TypeScript
interface MockConnection {
  execute: ReturnType<typeof vi.fn>;
  beginTransaction: ReturnType<typeof vi.fn>;
  commit: ReturnType<typeof vi.fn>;
  rollback: ReturnType<typeof vi.fn>;
  release: ReturnType<typeof vi.fn>;
}
// Mock dependencies
vi.mock("../../db/database.js", () => ({
  default: {
    execute: vi.fn(),
    getConnection: vi.fn(),
  },
}));

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    unlinkSync: vi.fn(),
  },
}));

// Mock path.resolve to return predictable paths for testing
const mockResolve = vi.spyOn(path, "resolve");
mockResolve.mockImplementation((...args: string[]) => args.join("/"));

describe("PostService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for pool.getConnection
    const mockConn: MockConnection = {
      execute: vi.fn(),
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn(),
    };

    vi.mocked(pool.getConnection).mockResolvedValue(mockConn as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createPost", () => {
    it("should create a post with images and return the correct structure", async () => {
      const mockConn = await pool.getConnection();

      // 1. insertPost call
      vi.mocked(mockConn.execute).mockImplementation(
        (sql: any, params?: any) => {
          const sqlStr = typeof sql === "string" ? sql.toLowerCase() : "";
          if (sqlStr.includes("insert into posts")) {
            return Promise.resolve([{ insertId: 101 }, {}] as any);
          }
          // For images
          return Promise.resolve([
            { insertId: 200 + (params?.[2] ?? 0) },
            {},
          ] as any);
        },
      );

      // Mock getUser call for the header data
      vi.mocked(pool.execute).mockResolvedValue([
        [{ username: "testuser", profile_image_url: "profile.jpg" }],
        {},
      ] as any);

      const result = await postService.createPost(1, "New Post Content", [
        "img1.jpg",
        "img2.jpg",
      ]);

      expect(result.id).toBe(101);
      expect(result.content).toBe("New Post Content");
      expect(mockConn.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockConn.commit).toHaveBeenCalledTimes(1);

      // Verify images were inserted in order
      expect(mockConn.execute).toHaveBeenCalledWith(expect.any(String), [
        101,
        "img1.jpg",
        0,
      ]);
    });

    it("should rollback on error during creation", async () => {
      const mockConn = await pool.getConnection();
      vi.mocked(mockConn.beginTransaction).mockRejectedValue(
        new Error("DB Error"),
      );

      await expect(postService.createPost(1, "Content")).rejects.toThrow(
        "DB Error",
      );
    });

    it("should rollback if image insertion fails", async () => {
      const mockConn = await pool.getConnection();

      let callCount = 0;
      vi.mocked(mockConn.execute).mockImplementation(() => {
        callCount++;
        if (callCount === 1)
          return Promise.resolve([{ insertId: 102 }, {}] as any); // Post inserted
        throw new Error("Image Insert Failed"); // Fail on image
      });

      await expect(
        postService.createPost(1, "Content", ["img.jpg"]),
      ).rejects.toThrow();
      expect(mockConn.rollback).toHaveBeenCalled();
    });
  });

  describe("getPostById", () => {
    it("should return post with grouped images", async () => {
      const mockRows = [
        {
          id: 1,
          user_id: 1,
          content: "Hello",
          autor: "User1",
          imagen_perfil: "",
          created_at: "2023-01-01",
          updated_at: "2023-01-01",
          image_id: null,
          image_url: null,
        },
        {
          id: 1,
          image_id: 10,
          user_id: 1,
          content: "Hello",
          autor: "User1",
          imagen_perfil: "",
          created_at: "2023-01-01",
          updated_at: "2023-01-01",
          image_url: "img1.jpg",
          image_created_at: "2023-01-01",
          order_index: 0,
        },
        {
          id: 1,
          image_id: 11,
          user_id: 1,
          content: "Hello",
          autor: "User1",
          imagen_perfil: "",
          created_at: "2023-01-01",
          updated_at: "2023-01-01",
          image_url: "img2.jpg",
          image_created_at: "2023-01-01",
          order_index: 1,
        },
      ];

      vi.mocked(pool.execute).mockResolvedValue([mockRows, {}] as any);
      const result = await postService.getPostById(1);

      expect(result?.id).toBe(1);
      // Ensure images is not undefined before checking length
      expect(result?.images?.length).toBe(2);
      expect(result?.images?.[0].image_url).toBe("img1.jpg");
    });

    it("should return null if post not found", async () => {
      vi.mocked(pool.execute).mockResolvedValue([[], {}] as any);
      const result = await postService.getPostById(999);
      expect(result).toBeNull();
    });
  });

  describe("modifyPost", () => {
    it("should update content and replace images if new ones provided", async () => {
      const mockConn = await pool.getConnection();
      vi.mocked(mockConn.execute).mockImplementation(
        (sql: any, params?: any) => {
          const sqlStr = typeof sql === "string" ? sql.toLowerCase() : "";
          if (sqlStr.includes("select user_id") || sqlStr.includes("user_id")) {
            return Promise.resolve([[{ user_id: 1 }], {}] as any);
          }
          if (sqlStr.includes("update")) {
            return Promise.resolve([[{}], {}] as any);
          }
          if (sqlStr.includes("delete")) {
            return Promise.resolve([[{}], {}] as any);
          }
          if (
            sqlStr.includes("insert into post_images") ||
            sqlStr.includes("insert")
          ) {
            return Promise.resolve([
              { insertId: 300 + (params?.[2] ?? 0) },
              {},
            ] as any);
          }
          return Promise.resolve([[{}], {}] as any);
        },
      );

      // Mock the getPostById call at the end of modifyPost
      vi.mocked(pool.execute).mockResolvedValue([
        [
          {
            id: 1,
            user_id: 1,
            content: "Updated",
            autor: "U",
            imagen_perfil: "",
            image_url: null,
            created_at: "t",
            updated_at: "t",
          },
          {
            id: 1,
            image_id: 300,
            user_id: 1,
            content: "Updated",
            autor: "U",
            imagen_perfil: "",
            image_url: "new.jpg",
            image_created_at: "t",
            order_index: 0,
            created_at: "t",
            updated_at: "t",
          },
        ],
        {},
      ] as any);

      await postService.modifyPost(1, 1, "Updated", ["new.jpg"]);

      expect(mockConn.beginTransaction).toHaveBeenCalled();
      expect(mockConn.commit).toHaveBeenCalled();
      // Verify new image was inserted
      expect(mockConn.execute).toHaveBeenCalledWith(expect.any(String), [
        1,
        "new.jpg",
        0,
      ]);
    });

    it("should throw error if user is not owner", async () => {
      const mockConn = await pool.getConnection();

      // Mock check result: different user
      vi.mocked(mockConn.execute).mockResolvedValue([
        [{ user_id: 999 }],
        {},
      ] as any);

      await expect(postService.modifyPost(1, 1, "Updated")).rejects.toThrow(
        "No tienes permisos para modificar esta publicación",
      );
    });
  });

  describe("deletePost", () => {
    it("should delete post, images from DB and files from FS", async () => {
      const mockConn = await pool.getConnection();
      const mockFs = vi.mocked(fs);

      vi.mocked(mockConn.execute).mockImplementation((sql: any) => {
        const sqlStr = typeof sql === "string" ? sql.toLowerCase() : "";
        if (sqlStr.includes("user_id")) {
          return Promise.resolve([[{ user_id: 1 }], {}] as any);
        }
        if (sqlStr.includes("image_url")) {
          return Promise.resolve([
            [{ image_url: "/absolute/path/to/uploads/img.jpg" }],
            {},
          ] as any);
        }
        return Promise.resolve([[{}], {}] as any);
      });

      mockFs.existsSync.mockReturnValue(true);

      const result = await postService.deletePost(1, 1);

      expect(result).toBe(true);
      expect(mockConn.commit).toHaveBeenCalled();
      expect(mockFs.unlinkSync).toHaveBeenCalledWith(
        "/absolute/path/to/uploads/img.jpg",
      );
    });

    it("should handle missing files gracefully", async () => {
      const mockConn = await pool.getConnection();
      const mockFs = vi.mocked(fs);

      vi.mocked(mockConn.execute).mockImplementation((sql: any) => {
        const sqlStr = typeof sql === "string" ? sql.toLowerCase() : "";
        if (sqlStr.includes("user_id")) {
          return Promise.resolve([[{ user_id: 1 }], {}] as any);
        }
        if (sqlStr.includes("image_url")) {
          return Promise.resolve([
            [{ image_url: "/absolute/path/to/uploads/missing.jpg" }],
            {},
          ] as any);
        }
        return Promise.resolve([[{}], {}] as any);
      });

      mockFs.existsSync.mockReturnValue(false);
      const result = await postService.deletePost(1, 1);

      expect(result).toBe(true);
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});
