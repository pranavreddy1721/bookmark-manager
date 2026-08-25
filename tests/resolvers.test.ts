import { describe, expect, test } from "bun:test";
import { GraphQLError } from "graphql";
import { resolvers } from "../src/graphql/resolvers.ts";

describe("Bookmark resolvers", () => {
  test("rejects an invalid bookmark URL", async () => {
    await expect(
      resolvers.Mutation.createBookmark(
        {},
        {
          title: "Invalid URL",
          url: "not-a-url",
          tags: ["test"],
          folderId: "folder-1",
        },
      ),
    ).rejects.toThrow("URL must be valid");
  });

  test("invalid URL produces BAD_USER_INPUT", async () => {
    try {
      await resolvers.Mutation.createBookmark(
        {},
        {
          title: "Invalid URL",
          url: "not-a-url",
          tags: ["test"],
          folderId: "folder-1",
        },
      );

      throw new Error("Expected createBookmark to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);

      const graphQLError = error as GraphQLError;

      expect(graphQLError.extensions.code).toBe("BAD_USER_INPUT");
    }
  });

  test("rejects an empty folder ID", async () => {
    await expect(
      resolvers.Mutation.createBookmark(
        {},
        {
          title: "Test Bookmark",
          url: "https://example.com",
          tags: ["test"],
          folderId: "   ",
        },
      ),
    ).rejects.toThrow("Folder ID is required");
  });
});