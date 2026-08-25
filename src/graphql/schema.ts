import { createSchema } from "graphql-yoga";
import { resolvers } from "./resolvers.ts";

const typeDefs = /* GraphQL */ `
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

  type BookmarkPage {
    items: [Bookmark!]!
    nextCursor: String
    hasNextPage: Boolean!
  }

  type Query {
    folders: [Folder!]!
    folder(id: ID!): Folder
    bookmarks(
      first: Int!
      after: String
      folderId: ID
      search: String
    ): BookmarkPage!
  }

  type Mutation {
    createFolder(name: String!): Folder!
    updateFolder(id: ID!, name: String!): Folder!
    deleteFolder(id: ID!): Boolean!

    createBookmark(
      title: String!
      url: String!
      tags: [String!]!
      folderId: ID!
    ): Bookmark!

    updateBookmark(
      id: ID!
      title: String!
      url: String!
      tags: [String!]!
      folderId: ID!
    ): Bookmark!

    deleteBookmark(id: ID!): Boolean!

    moveBookmark(
      id: ID!
      folderId: ID!
    ): Bookmark!
  }
`;

export const schema = createSchema({
  typeDefs,
  resolvers,
});