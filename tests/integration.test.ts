import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { prisma } from "../src/lib/prisma.ts";

describe("PostgreSQL integration", () => {
  let folderId: string;
  let bookmarkId: string;

  beforeAll(async () => {
    const folder = await prisma.folder.create({
      data: {
        name: `Integration Test Folder ${Date.now()}`,
      },
    });

    folderId = folder.id;

    const bookmark = await prisma.bookmark.create({
      data: {
        title: "Integration Test Bookmark",
        url: "https://example.com/integration",
        tags: ["integration", "postgres"],
        folderId,
      },
    });

    bookmarkId = bookmark.id;
  });

  afterAll(async () => {
    if (bookmarkId) {
      await prisma.bookmark.delete({
        where: {
          id: bookmarkId,
        },
      });
    }

    if (folderId) {
      await prisma.folder.delete({
        where: {
          id: folderId,
        },
      });
    }

    await prisma.$disconnect();
  });

  test("creates and reads a bookmark from PostgreSQL", async () => {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    expect(bookmark).not.toBeNull();
    expect(bookmark?.title).toBe("Integration Test Bookmark");
    expect(bookmark?.url).toBe("https://example.com/integration");
    expect(bookmark?.tags).toEqual(["integration", "postgres"]);
    expect(bookmark?.folderId).toBe(folderId);
  });

  test("loads bookmarks through the Folder relationship", async () => {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        folderId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    expect(bookmarks.length).toBe(1);
    expect(bookmarks[0]?.id).toBe(bookmarkId);
  });
});