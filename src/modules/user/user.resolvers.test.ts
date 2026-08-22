import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userResolvers } from "./user.resolvers.js";

// Mock dependencies
vi.mock("../../db/database.js", () => ({
  default: {
    execute: vi.fn(),
    query: vi.fn(),
    getConnection: vi.fn(),
  },
}));

vi.mock("../auth/AuthService.js", () => ({
  authServices: {
    findUserByUsername: vi.fn(),
  },
}));

vi.mock("./UserService.js", () => ({
  userService: {
    getUserById: vi.fn(),
    updateUserProfile: vi.fn(),
    getFriendsList: vi.fn(),
    getSuggestedUsers: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
  },
}));

vi.mock("../post/PostService.js", () => ({
  postService: {
    createPost: vi.fn(),
  },
}));

vi.mock("../comment/CommentService.js", () => ({
  commentService: {
    createComment: vi.fn(),
  },
}));

describe("userResolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Query", () => {
    describe("me", () => {
      it("should return null if user not in context", async () => {
        const result = await userResolvers.Query.me({}, {}, {} as any);
        expect(result).toBeNull();
      });
    });
  });
});
