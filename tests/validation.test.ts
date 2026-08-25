import { describe, expect, test } from "bun:test";
import { GraphQLError } from "graphql";
import { validateBookmarkInput } from "../src/validation/bookmark.ts";

describe("validateBookmarkInput", () => {
  test("accepts a valid bookmark", () => {
    expect(() =>
      validateBookmarkInput({
        title: "Bun Documentation",
        url: "https://bun.sh/docs",
        tags: ["bun", "typescript"],
        folderId: "folder-1",
      }),
    ).not.toThrow();
  });

  test("rejects an invalid URL with BAD_USER_INPUT", () => {
    try {
      validateBookmarkInput({
        title: "Invalid URL",
        url: "not-a-url",
        tags: ["test"],
        folderId: "folder-1",
      });

      throw new Error("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);

      const graphQLError = error as GraphQLError;

      expect(graphQLError.message).toBe("URL must be valid");
      expect(graphQLError.extensions.code).toBe("BAD_USER_INPUT");
    }
  });

  test("rejects an empty title", () => {
    expect(() =>
      validateBookmarkInput({
        title: "   ",
        url: "https://example.com",
        tags: [],
        folderId: "folder-1",
      }),
    ).toThrow("Title is required");
  });

  test("rejects more than 20 tags", () => {
    expect(() =>
      validateBookmarkInput({
        title: "Too Many Tags",
        url: "https://example.com",
        tags: Array.from({ length: 21 }, (_, index) => `tag-${index}`),
        folderId: "folder-1",
      }),
    ).toThrow("A bookmark can have at most 20 tags");
  });
});