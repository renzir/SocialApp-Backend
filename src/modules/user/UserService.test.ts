import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import pool from "../../db/database.js";
import { userService } from "./UserService.js";

// Mock database pool
vi.mock("../../db/database.js", () => ({
  default: {
    execute: vi.fn(),
    query: vi.fn(),
    getConnection: vi.fn(),
  },
}));

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getUserById", () => {
    it("should return a user when found", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        email_verified: true,
        profile_image_url: "profile.jpg",
        banner_image_url: "banner.jpg",
        bio: "Bio text",
        created_at: "2023-01-01",
      };

      vi.mocked(pool.execute).mockResolvedValue([[mockUser], []] as any);

      const result = await userService.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(pool.execute).toHaveBeenCalledWith(expect.any(String), [1]);
    });

    it("should return null when user not found", async () => {
      vi.mocked(pool.execute).mockResolvedValue([[], []] as any);

      const result = await userService.getUserById(999);

      expect(result).toBeNull();
      expect(pool.execute).toHaveBeenCalledWith(expect.any(String), [999]);
    });
  });

  describe("updateUserProfile", () => {
    it("should update profile with provided fields and return updated user", async () => {
      const mockUpdatedUser = {
        id: 1,
        username: "newusername",
        email: "test@example.com",
        email_verified: true,
        profile_image_url: "new-profile.jpg",
        banner_image_url: null,
        bio: "New bio",
        created_at: "2023-01-01",
      };

      const mockMockConn: any = {
        execute: vi.fn(),
        beginTransaction: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
        release: vi.fn(),
      };
      vi.mocked(pool.getConnection).mockResolvedValue(mockMockConn);

      mockMockConn.execute.mockImplementation((sql: any) => {
        const sqlStr = typeof sql === "string" ? sql.toLowerCase() : "";

        if (sqlStr.includes("select id from users where username")) {
          return Promise.resolve([[], []] as any);
        }

        if (sqlStr.includes("update users set")) {
          return Promise.resolve([[{ affectedRows: 1 }], []] as any);
        }

        if (sqlStr.includes("select id, username")) {
          return Promise.resolve([[mockUpdatedUser], []] as any);
        }

        return Promise.resolve([[{}], []] as any);
      });

      const input = {
        username: "newusername",
        bio: "New bio",
        profile_image_url: "new-profile.jpg",
      };

      vi.mocked(pool.execute).mockResolvedValue([[mockUpdatedUser], []] as any);

      const result = await userService.updateUserProfile(1, input as any);

      expect(mockMockConn.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockMockConn.commit).toHaveBeenCalledTimes(1);
      expect(result.username).toBe("newusername");
      expect(result.bio).toBe("New bio");
    });

    it("should throw error when username is already taken", async () => {
      const mockMockConn: any = {
        execute: vi.fn(),
        beginTransaction: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
        release: vi.fn(),
      };
      vi.mocked(pool.getConnection).mockResolvedValue(mockMockConn);

      mockMockConn.execute.mockImplementation((sql: any) => {
        const sqlStr = typeof sql === "string" ? sql.toLowerCase() : "";

        if (sqlStr.includes("select id from users where username")) {
          return Promise.resolve([[{ id: 5 }], []] as any);
        }

        return Promise.resolve([[{}], []] as any);
      });

      await expect(
        userService.updateUserProfile(1, { username: "takenuser" } as any),
      ).rejects.toThrow("El nombre de usuario ya está en uso");

      expect(mockMockConn.rollback).toHaveBeenCalledTimes(1);
    });

    it("should rollback on error during update", async () => {
      const mockMockConn: any = {
        execute: vi.fn(),
        beginTransaction: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
        release: vi.fn(),
      };
      vi.mocked(pool.getConnection).mockResolvedValue(mockMockConn);

      mockMockConn.execute.mockRejectedValue(new Error("DB Error"));

      await expect(
        userService.updateUserProfile(1, { bio: "test" } as any),
      ).rejects.toThrow("DB Error");

      expect(mockMockConn.rollback).toHaveBeenCalledTimes(1);
    });

    it("should update only provided fields", async () => {
      const mockMockConn: any = {
        execute: vi.fn(),
        beginTransaction: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
        release: vi.fn(),
      };
      vi.mocked(pool.getConnection).mockResolvedValue(mockMockConn);

      const mockUpdatedUser = {
        id: 1,
        username: "existinguser",
        email: "test@example.com",
        email_verified: true,
        profile_image_url: null,
        banner_image_url: "new-banner.jpg",
        bio: null,
        created_at: "2023-01-01",
      };

      mockMockConn.execute.mockImplementation((sql: any) => {
        const sqlStr = typeof sql === "string" ? sql.toLowerCase() : "";

        if (sqlStr.includes("update users set")) {
          return Promise.resolve([[{ affectedRows: 1 }], []] as any);
        }

        if (sqlStr.includes("select id, username")) {
          return Promise.resolve([[mockUpdatedUser], []] as any);
        }

        return Promise.resolve([[{}], []] as any);
      });

      const input = { banner_image_url: "new-banner.jpg" };
      vi.mocked(pool.execute).mockResolvedValue([[mockUpdatedUser], []] as any);
      const result = await userService.updateUserProfile(1, input as any);

      expect(result.banner_image_url).toBe("new-banner.jpg");
    });
  });

  describe("getFriendsList", () => {
    it("should return list of friends", async () => {
      const mockFriends = [
        {
          id: 2,
          username: "friend1",
          email_verified: true,
          profile_image_url: "f1.jpg",
          banner_image_url: null,
          bio: "Friend 1",
          created_at: "2023-01-01",
        },
        {
          id: 3,
          username: "friend2",
          email_verified: true,
          profile_image_url: "f2.jpg",
          banner_image_url: null,
          bio: "Friend 2",
          created_at: "2023-01-02",
        },
      ];

      vi.mocked(pool.execute).mockResolvedValue([mockFriends, []] as any);

      const result = await userService.getFriendsList(1);

      expect(result.length).toBe(2);
      expect(result[0].username).toBe("friend1");
      expect(result[1].username).toBe("friend2");
    });

    it("should return empty array when no friends", async () => {
      vi.mocked(pool.execute).mockResolvedValue([[], []] as any);

      const result = await userService.getFriendsList(1);

      expect(result.length).toBe(0);
    });
  });

  describe("getFriendRequests", () => {
    it("should return list of friend requests", async () => {
      const mockRequests = [
        { id: 2, username: "requester1", profile_image_url: "r1.jpg" },
        { id: 3, username: "requester2", profile_image_url: "r2.jpg" },
      ];

      vi.mocked(pool.execute).mockResolvedValue([mockRequests, []] as any);

      const result = await userService.getFriendRequests(1);

      expect(result.length).toBe(2);
      expect(result[0].username).toBe("requester1");
    });

    it("should return empty array when no requests", async () => {
      vi.mocked(pool.execute).mockResolvedValue([[], []] as any);

      const result = await userService.getFriendRequests(1);

      expect(result.length).toBe(0);
    });
  });

  describe("blockUser", () => {
    it("should delete existing friendship and insert block", async () => {
      const mockMockConn: any = {
        execute: vi.fn(),
        beginTransaction: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
        release: vi.fn(),
      };
      vi.mocked(pool.getConnection).mockResolvedValue(mockMockConn);

      mockMockConn.execute.mockResolvedValue([
        [{ affectedRows: 1 }],
        [],
      ] as any);

      await userService.blockUser(1, 2);

      expect(mockMockConn.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockMockConn.commit).toHaveBeenCalledTimes(1);

      const executeCalls = mockMockConn.execute.mock.calls;

      const firstCallSql =
        typeof executeCalls[0][0] === "string"
          ? executeCalls[0][0].toLowerCase()
          : "";
      expect(firstCallSql).toContain("delete from friendships");
      expect(executeCalls[0][1]).toEqual([1, 2, 2, 1]);

      const secondCallSql =
        typeof executeCalls[1][0] === "string"
          ? executeCalls[1][0].toLowerCase()
          : "";
      expect(secondCallSql).toContain("insert into blocks");
      expect(executeCalls[1][1]).toEqual([1, 2]);
    });

    it("should rollback on error during block", async () => {
      const mockMockConn: any = {
        execute: vi.fn(),
        beginTransaction: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
        release: vi.fn(),
      };
      vi.mocked(pool.getConnection).mockResolvedValue(mockMockConn);

      mockMockConn.execute.mockRejectedValue(new Error("DB Error"));

      await expect(userService.blockUser(1, 2)).rejects.toThrow("DB Error");

      expect(mockMockConn.rollback).toHaveBeenCalledTimes(1);
    });
  });

  describe("unblockUser", () => {
    it("should delete block entry", async () => {
      vi.mocked(pool.execute).mockResolvedValue([
        { affectedRows: 1 },
        [],
      ] as any);

      await userService.unblockUser(1, 2);

      expect(pool.execute).toHaveBeenCalledWith(expect.any(String), [1, 2]);
    });
  });

  describe("isBlocked", () => {
    it("should return true when user is blocked", async () => {
      vi.mocked(pool.execute).mockResolvedValue([
        [{ blocker_id: 1, blocked_id: 2 }],
        [],
      ] as any);

      const result = await userService.isBlocked(1, 2);

      expect(result).toBe(true);
    });

    it("should return false when user is not blocked", async () => {
      vi.mocked(pool.execute).mockResolvedValue([[], []] as any);

      const result = await userService.isBlocked(1, 2);

      expect(result).toBe(false);
    });
  });

  describe("getSuggestedUsers", () => {
    it("should return suggested users excluding friends and blocked", async () => {
      const mockSuggestions = [
        {
          id: 4,
          username: "suggestion1",
          profile_image_url: "s1.jpg",
          bio: "Suggestion 1",
        },
        {
          id: 5,
          username: "suggestion2",
          profile_image_url: "s2.jpg",
          bio: "Suggestion 2",
        },
      ];

      vi.mocked(pool.query).mockResolvedValue([mockSuggestions, []] as any);

      const result = await userService.getSuggestedUsers(1, 10);

      expect(result.length).toBe(2);
      expect(result[0].username).toBe("suggestion1");
      expect(pool.query).toHaveBeenCalled();
    });

    it("should return empty array when no suggestions", async () => {
      vi.mocked(pool.query).mockResolvedValue([[], []] as any);

      const result = await userService.getSuggestedUsers(1, 10);

      expect(result.length).toBe(0);
    });
  });
});
