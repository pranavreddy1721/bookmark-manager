import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type Folder {
    id: ID!
    name: String!
    createdAt: String!
    updatedAt: String!
    bookmarks: [Bookmark!]!
  }

  type Bookmark {
    id: ID!
    title: String!
    url: String!
    tags: [String!]!
    folderId: ID!
    createdAt: String!
    updatedAt: String!
  }

  type BookmarkConnection {
    items: [Bookmark!]!
    nextCursor: String
    hasMore: Boolean!
  }

  type Query {
    folders: [Folder!]!
    folder(id: ID!): Folder
    bookmarks(
      folderId: ID
      search: String
      take: Int
      cursor: String
    ): BookmarkConnection!
  }

  input CreateFolderInput {
    name: String!
  }

  input CreateBookmarkInput {
    title: String!
    url: String!
    tags: [String!]
    folderId: ID!
  }

  input UpdateBookmarkInput {
    title: String
    url: String
    tags: [String!]
  }

  type Mutation {
    createFolder(input: CreateFolderInput!): Folder!

    createBookmark(input: CreateBookmarkInput!): Bookmark!

    updateBookmark(
      id: ID!
      input: UpdateBookmarkInput!
    ): Bookmark!

    deleteBookmark(id: ID!): Boolean!

    moveBookmark(
      id: ID!
      folderId: ID!
    ): Bookmark!
  }
`);
