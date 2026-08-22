// Backend/src/modules/post/post.resolvers.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as zodSchemas from "../../types/zodSchemas.js";
import { postResolvers } from "./post.resolvers.js";
import { postService } from "./PostService.js";

// Mock dependencies
vi.mock("./PostService.js", () => ({
  postService: {
    getPostById: vi.fn(),
    getAllPosts: vi.fn(),
    createPost: vi.fn(),
    modifyPost: vi.fn(),
    deletePost: vi.fn(),
  },
}));

vi.mock("../../types/zodSchemas.js", () => ({
  createPostSchema: {
    parse: vi.fn((data: any) => data),
  },
  modifyPostSchema: {
    parse: vi.fn((data: any) => data),
  },
}));

describe("postResolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Query", () => {
    describe("getPostById", () => {
      it("should throw error if postId is NaN", async () => {
        await expect(
          postResolvers.Query.getPostById({}, { postId: "abc" } as any),
        ).rejects.toThrow("ID de publicación inválido");
      });

      it("should call service with numeric ID on success", async () => {
        vi.mocked(postService.getPostById).mockResolvedValue({
          id: 1,
          content: "Hello",
        } as any);

        const result = await postResolvers.Query.getPostById({}, {
          postId: "10",
        } as any);

        expect(postService.getPostById).toHaveBeenCalledWith(10);
        expect(result?.id).toBe(1);
      });

      it("should handle service returning null", async () => {
        vi.mocked(postService.getPostById).mockResolvedValue(null);

        const result = await postResolvers.Query.getPostById({}, {
          postId: "1",
        } as any);
        expect(result).toBeNull();
      });
    });

    describe("getAllPosts", () => {
      it("should return all posts", async () => {
        const mockPosts = [
          { id: 1, content: "A" },
          { id: 2, content: "B" },
        ];
        vi.mocked(postService.getAllPosts).mockResolvedValue(mockPosts as any);

        const result = await postResolvers.Query.getAllPosts();

        expect(postService.getAllPosts).toHaveBeenCalled();
        expect(result).toEqual(mockPosts);
      });
    });
  });

  describe("Mutation", () => {
    const mockContextWithUser = { user: { id: 5 } };
    const mockContextNoUser = {};

    describe("createPost", () => {
      it("should throw if not authenticated", async () => {
        await expect(
          postResolvers.Mutation.createPost(
            {},
            { content: "test" },
            mockContextNoUser as any,
          ),
        ).rejects.toThrow("No estás autenticado");
      });

      it("should validate content via Zod and call service", async () => {
        vi.mocked(postService.createPost).mockResolvedValue({
          id: 10,
          content: "test",
        } as any);

        // Assuming schema doesn't throw for valid input in our mock above
        const result = await postResolvers.Mutation.createPost(
          {},
          { content: "Valid Content", images: ["img.png"] },
          mockContextWithUser as any,
        );

        expect(zodSchemas.createPostSchema.parse).toHaveBeenCalledWith({
          content: "Valid Content",
        });
        expect(postService.createPost).toHaveBeenCalledWith(
          5,
          "Valid Content",
          ["img.png"],
        );

        // Use result to avoid unused variable warning if needed, though vitest might complain less with assertions
        expect(result.id).toBe(10);
      });
    });

    describe("modifyPost", () => {
      it("should throw if not authenticated", async () => {
        await expect(
          postResolvers.Mutation.modifyPost(
            {},
            { postId: "1", content: "upd" },
            mockContextNoUser as any,
          ),
        ).rejects.toThrow("No estás autenticado");
      });

      it("should throw if postId is invalid", async () => {
        await expect(
          postResolvers.Mutation.modifyPost(
            {},
            { postId: "xyz", content: "upd" },
            mockContextWithUser as any,
          ),
        ).rejects.toThrow("ID de publicación inválido");
      });

      it("should call service with parsed data on success", async () => {
        vi.mocked(postService.modifyPost).mockResolvedValue({
          id: 1,
          content: "Updated",
        } as any);

        const result = await postResolvers.Mutation.modifyPost(
          {},
          { postId: "1", content: "Updated Content" },
          mockContextWithUser as any,
        );

        expect(zodSchemas.modifyPostSchema.parse).toHaveBeenCalledWith({
          content: "Updated Content",
        });
        expect(postService.modifyPost).toHaveBeenCalledWith(
          1,
          5,
          "Updated Content",
          undefined,
        );

        // Verify result correctness
        expect(result.content).toBe("Updated");
      });
    });

    describe("deletePost", () => {
      it("should throw if not authenticated", async () => {
        await expect(
          postResolvers.Mutation.deletePost(
            {},
            { postId: "1" },
            mockContextNoUser as any,
          ),
        ).rejects.toThrow("No estás autenticado");
      });

      it("should throw if postId is invalid", async () => {
        await expect(
          postResolvers.Mutation.deletePost(
            {},
            { postId: "bad" },
            mockContextWithUser as any,
          ),
        ).rejects.toThrow("ID de publicación inválido");
      });

      it("should call service and return success message on success", async () => {
        vi.mocked(postService.deletePost).mockResolvedValue(true as any);

        const result = await postResolvers.Mutation.deletePost(
          {},
          { postId: "5" },
          mockContextWithUser as any,
        );

        expect(postService.deletePost).toHaveBeenCalledWith(5, 5);
        expect(result).toEqual({
          success: true,
          message: "Post eliminado exitosamente",
        });
      });
    });
  });
});
