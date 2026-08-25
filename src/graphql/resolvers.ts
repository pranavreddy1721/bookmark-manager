import { GraphQLError } from "graphql";
import { Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";
import { validateBookmarkInput } from "../validation/bookmark.ts";

type BookmarkCursor = {
  createdAt: string;
  id: string;
};

type BookmarkQueryArgs = {
  first: number;
  after?: string | null;
  folderId?: string | null;
  search?: string | null;
};

function encodeCursor(cursor: BookmarkCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): BookmarkCursor {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(decoded);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("createdAt" in parsed) ||
      !("id" in parsed) ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.id !== "string"
    ) {
      throw new Error("Invalid cursor");
    }

    return {
      createdAt: parsed.createdAt,
      id: parsed.id,
    };
  } catch {
    throw new GraphQLError("Invalid cursor", {
      extensions: {
        code: "BAD_USER_INPUT",
      },
    });
  }
}

function handlePrismaNotFound(
  error: unknown,
  message: string,
): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    throw new GraphQLError(message, {
      extensions: {
        code: "NOT_FOUND",
      },
    });
  }

  throw error;
}

function handlePrismaForeignKeyError(
  error: unknown,
  message: string,
): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  ) {
    throw new GraphQLError(message, {
      extensions: {
        code: "NOT_FOUND",
      },
    });
  }

  throw error;
}

export const resolvers = {
  Query: {
    folders: async () => {
      return prisma.folder.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });
    },

    folder: async (_parent: unknown, args: { id: string }) => {
      return prisma.folder.findUnique({
        where: {
          id: args.id,
        },
      });
    },

    bookmarks: async (
      _parent: unknown,
      args: BookmarkQueryArgs,
    ) => {
      if (args.first < 1 || args.first > 100) {
        throw new GraphQLError("first must be between 1 and 100", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const cursor = args.after ? decodeCursor(args.after) : null;

      const search = args.search?.trim() || undefined;
      const folderId = args.folderId?.trim() || undefined;

      const filters = [];

      if (folderId) {
        filters.push({
          folderId,
        });
      }

      if (search) {
        filters.push({
          title: {
            contains: search,
            mode: "insensitive" as const,
          },
        });
      }

      if (cursor) {
        filters.push({
          OR: [
            {
              createdAt: {
                gt: new Date(cursor.createdAt),
              },
            },
            {
              createdAt: new Date(cursor.createdAt),
              id: {
                gt: cursor.id,
              },
            },
          ],
        });
      }

      const bookmarks = await prisma.bookmark.findMany({
        take: args.first + 1,

        ...(filters.length > 0
          ? {
              where: {
                AND: filters,
              },
            }
          : {}),

        orderBy: [
          {
            createdAt: "asc",
          },
          {
            id: "asc",
          },
        ],
      });

      const hasNextPage = bookmarks.length > args.first;

      const items = hasNextPage
        ? bookmarks.slice(0, args.first)
        : bookmarks;

      const lastItem = items.at(-1);

      const nextCursor =
        hasNextPage && lastItem
          ? encodeCursor({
              createdAt: lastItem.createdAt.toISOString(),
              id: lastItem.id,
            })
          : null;

      return {
        items,
        nextCursor,
        hasNextPage,
      };
    },
  },

  Folder: {
    bookmarks: async (parent: { id: string }) => {
      return prisma.bookmark.findMany({
        where: {
          folderId: parent.id,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    },
  },

  Mutation: {
    createFolder: async (
      _parent: unknown,
      args: { name: string },
    ) => {
      return prisma.folder.create({
        data: {
          name: args.name,
        },
      });
    },

    updateFolder: async (
      _parent: unknown,
      args: { id: string; name: string },
    ) => {
      try {
        return await prisma.folder.update({
          where: {
            id: args.id,
          },
          data: {
            name: args.name,
          },
        });
      } catch (error) {
        return handlePrismaNotFound(
          error,
          "Folder not found",
        );
      }
    },

    deleteFolder: async (
      _parent: unknown,
      args: { id: string },
    ) => {
      try {
        await prisma.folder.delete({
          where: {
            id: args.id,
          },
        });

        return true;
      } catch (error) {
        return handlePrismaNotFound(
          error,
          "Folder not found",
        );
      }
    },

    createBookmark: async (
      _parent: unknown,
      args: {
        title: string;
        url: string;
        tags: string[];
        folderId: string;
      },
    ) => {
      validateBookmarkInput(args);

      try {
        return await prisma.bookmark.create({
          data: {
            title: args.title.trim(),
            url: args.url.trim(),
            tags: args.tags.map((tag) => tag.trim()),
            folderId: args.folderId.trim(),
          },
        });
      } catch (error) {
        return handlePrismaForeignKeyError(
          error,
          "Folder not found",
        );
      }
    },

    updateBookmark: async (
      _parent: unknown,
      args: {
        id: string;
        title: string;
        url: string;
        tags: string[];
        folderId: string;
      },
    ) => {
      validateBookmarkInput(args);

      try {
        return await prisma.bookmark.update({
          where: {
            id: args.id,
          },
          data: {
            title: args.title.trim(),
            url: args.url.trim(),
            tags: args.tags.map((tag) => tag.trim()),
            folderId: args.folderId.trim(),
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError
        ) {
          if (error.code === "P2025") {
            throw new GraphQLError(
              "Bookmark not found",
              {
                extensions: {
                  code: "NOT_FOUND",
                },
              },
            );
          }

          if (error.code === "P2003") {
            throw new GraphQLError(
              "Folder not found",
              {
                extensions: {
                  code: "NOT_FOUND",
                },
              },
            );
          }
        }

        throw error;
      }
    },

    deleteBookmark: async (
      _parent: unknown,
      args: { id: string },
    ) => {
      try {
        await prisma.bookmark.delete({
          where: {
            id: args.id,
          },
        });

        return true;
      } catch (error) {
        return handlePrismaNotFound(
          error,
          "Bookmark not found",
        );
      }
    },

    moveBookmark: async (
      _parent: unknown,
      args: {
        id: string;
        folderId: string;
      },
    ) => {
      if (!args.folderId.trim()) {
        throw new GraphQLError("Folder ID is required", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      try {
        return await prisma.bookmark.update({
          where: {
            id: args.id,
          },
          data: {
            folderId: args.folderId.trim(),
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError
        ) {
          if (error.code === "P2025") {
            throw new GraphQLError(
              "Bookmark not found",
              {
                extensions: {
                  code: "NOT_FOUND",
                },
              },
            );
          }

          if (error.code === "P2003") {
            throw new GraphQLError(
              "Folder not found",
              {
                extensions: {
                  code: "NOT_FOUND",
                },
              },
            );
          }
        }

        throw error;
      }
    },
  },
};