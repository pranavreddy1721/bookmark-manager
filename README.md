# Bookmark Manager

A production-minded Bookmark Manager API built with **Bun, TypeScript, GraphQL Yoga, Prisma, and PostgreSQL**.

The application provides folder and bookmark management through a GraphQL API, including tags, cursor-based pagination, filtering, title search, validation, predictable GraphQL errors, and PostgreSQL integration tests.

---

## Tech Stack

- **Bun** — JavaScript/TypeScript runtime
- **TypeScript** — Type-safe application code
- **GraphQL** — API query language
- **GraphQL Yoga** — GraphQL server
- **Prisma** — ORM and database access
- **PostgreSQL** — Relational database
- **Docker** — Local PostgreSQL environment
- **Bun Test** — Automated testing

---

## Features

- Folder CRUD operations
- Bookmark CRUD operations
- Bookmark tags
- Move bookmarks between folders
- Nested `Folder.bookmarks` queries
- Cursor-based bookmark pagination
- Filter bookmarks by folder
- Case-insensitive substring search by title
- Bookmark input validation
- Predictable GraphQL error codes
- PostgreSQL integration
- Automated unit and integration tests
- TypeScript type checking

---

## Project Structure

```text
bookmark-manager/
├── prisma/
│   ├── migrations/
│   │   ├── migration_lock.toml
│   │   ├── 20260824163621_init/
│   │   │   └── migration.sql
│   │   └── 20260824170356_add_bookmark_tags/
│   │       └── migration.sql
│   └── schema.prisma
│
├── src/
│   ├── graphql/
│   │   ├── resolvers.ts
│   │   └── schema.ts
│   ├── lib/
│   │   └── prisma.ts
│   ├── validation/
│   │   └── bookmark.ts
│   └── server.ts
│
├── tests/
│   ├── integration.test.ts
│   ├── resolvers.test.ts
│   └── validation.test.ts
│
├── .env
├── docker-compose.yml
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

---

## Prerequisites

Install the following before running the project:

- [Bun](https://bun.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

The application uses PostgreSQL running inside Docker.

---

## Installation

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
```

Enter the project directory:

```bash
cd bookmark-manager
```

Install dependencies:

```bash
bun install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bookmark_manager?schema=public"
```

The application uses `DATABASE_URL` to connect to PostgreSQL.

Do not commit `.env` or real credentials to source control.

---

## Start PostgreSQL

Start the PostgreSQL container:

```bash
docker compose up -d
```

Check the running containers:

```bash
docker ps
```

The PostgreSQL container should be running and healthy.

The database is exposed on:

```text
localhost:5432
```

---

## Database Setup

Apply the Prisma migrations:

```bash
bunx prisma migrate dev
```

Generate the Prisma Client:

```bash
bunx prisma generate
```

The database contains the following main models:

- `Folder`
- `Bookmark`

---

## Run the Development Server

Start the development server:

```bash
bun run dev
```

The GraphQL API is available at:

```text
http://localhost:4000/graphql
```

The development server uses Bun watch mode and automatically reloads when source files change.

---

## Production-Style Start

To start the server without watch mode:

```bash
bun run start
```

The server uses port `4000` by default.

A different port can be provided through the `PORT` environment variable.

---

# GraphQL API

The GraphQL endpoint is:

```text
POST http://localhost:4000/graphql
```

---

## Query Folders

```graphql
query {
  folders {
    id
    name
    createdAt
    updatedAt
    bookmarks {
      id
      title
      url
      tags
      folderId
    }
  }
}
```

---

## Query a Single Folder

```graphql
query {
  folder(id: "FOLDER_ID") {
    id
    name
    createdAt
    updatedAt
    bookmarks {
      id
      title
      url
      tags
      folderId
      createdAt
      updatedAt
    }
  }
}
```

---

# Bookmark Pagination

Bookmarks use cursor-based pagination.

The `first` argument controls the number of records returned.

```graphql
query {
  bookmarks(first: 10) {
    items {
      id
      title
      url
      tags
      folderId
      createdAt
      updatedAt
    }
    nextCursor
    hasNextPage
  }
}
```

The API returns:

```text
items
nextCursor
hasNextPage
```

When `hasNextPage` is `true`, use `nextCursor` as the `after` value for the next request.

Example:

```graphql
query {
  bookmarks(
    first: 10
    after: "NEXT_CURSOR"
  ) {
    items {
      id
      title
      url
      tags
      folderId
    }
    nextCursor
    hasNextPage
  }
}
```

---

# Bookmark Filtering

## Filter by Folder

```graphql
query {
  bookmarks(
    first: 10
    folderId: "FOLDER_ID"
  ) {
    items {
      id
      title
      url
      tags
      folderId
    }
    nextCursor
    hasNextPage
  }
}
```

---

## Search by Title

The `search` argument performs a case-insensitive substring search against bookmark titles.

```graphql
query {
  bookmarks(
    first: 10
    search: "documentation"
  ) {
    items {
      id
      title
      url
      tags
      folderId
    }
    nextCursor
    hasNextPage
  }
}
```

For example, a search for:

```text
Pagination
```

can return:

```text
Pagination Test 1
Pagination Test 2
```

---

## Combine Search, Folder Filtering, and Pagination

The filtering options can be used together.

```graphql
query {
  bookmarks(
    first: 10
    search: "documentation"
    folderId: "FOLDER_ID"
  ) {
    items {
      id
      title
      url
      tags
      folderId
    }
    nextCursor
    hasNextPage
  }
}
```

Pagination can also be continued using `after`:

```graphql
query {
  bookmarks(
    first: 10
    after: "NEXT_CURSOR"
    search: "documentation"
    folderId: "FOLDER_ID"
  ) {
    items {
      id
      title
      url
      tags
      folderId
    }
    nextCursor
    hasNextPage
  }
}
```

---

# Folder Mutations

## Create Folder

```graphql
mutation {
  createFolder(name: "Development") {
    id
    name
    createdAt
    updatedAt
  }
}
```

---

## Update Folder

```graphql
mutation {
  updateFolder(
    id: "FOLDER_ID"
    name: "Work"
  ) {
    id
    name
    createdAt
    updatedAt
  }
}
```

---

## Delete Folder

```graphql
mutation {
  deleteFolder(id: "FOLDER_ID")
}
```

Deleting a folder also deletes its bookmarks because the Prisma relationship uses cascade deletion.

---

# Bookmark Mutations

## Create Bookmark

```graphql
mutation {
  createBookmark(
    title: "Bun Documentation"
    url: "https://bun.sh/docs"
    tags: [
      "bun"
      "typescript"
      "development"
    ]
    folderId: "FOLDER_ID"
  ) {
    id
    title
    url
    tags
    folderId
    createdAt
    updatedAt
  }
}
```

---

## Update Bookmark

```graphql
mutation {
  updateBookmark(
    id: "BOOKMARK_ID"
    title: "Bun Documentation Updated"
    url: "https://bun.sh/docs/runtime"
    tags: [
      "bun"
      "runtime"
      "typescript"
    ]
    folderId: "FOLDER_ID"
  ) {
    id
    title
    url
    tags
    folderId
    createdAt
    updatedAt
  }
}
```

---

## Move Bookmark

```graphql
mutation {
  moveBookmark(
    id: "BOOKMARK_ID"
    folderId: "NEW_FOLDER_ID"
  ) {
    id
    title
    folderId
    updatedAt
  }
}
```

---

## Delete Bookmark

```graphql
mutation {
  deleteBookmark(id: "BOOKMARK_ID")
}
```

---

# Validation

Bookmark creation and updates validate the following:

- Title is required
- Title must be 200 characters or fewer
- URL is required
- URL must be valid
- Folder ID is required
- Maximum 20 tags per bookmark
- Tags cannot be empty
- Each tag must be 50 characters or fewer

Invalid input returns a GraphQL error using:

```text
BAD_USER_INPUT
```

Example:

```text
URL must be valid
```

with:

```text
code: BAD_USER_INPUT
```

---

# Error Handling

The API provides predictable GraphQL error codes.

## BAD_USER_INPUT

Used for invalid client input, including:

- Invalid URL
- Empty title
- Empty folder ID
- Too many tags
- Empty tags
- Tags longer than 50 characters
- Invalid pagination cursor
- Invalid pagination size

Example:

```json
{
  "errors": [
    {
      "message": "URL must be valid",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ],
  "data": null
}
```

---

## NOT_FOUND

Used when a requested resource does not exist.

Examples:

- Bookmark does not exist
- Folder does not exist
- Bookmark is moved to a nonexistent folder

Example:

```json
{
  "errors": [
    {
      "message": "Folder not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ],
  "data": null
}
```

---

# Database Design

## Folder

A `Folder` contains:

- `id`
- `name`
- `createdAt`
- `updatedAt`

A folder can contain multiple bookmarks.

The folder name is unique.

---

## Bookmark

A `Bookmark` contains:

- `id`
- `title`
- `url`
- `tags`
- `folderId`
- `createdAt`
- `updatedAt`

Each bookmark belongs to exactly one folder.

---

## Relationships

```text
Folder
  │
  └── has many
          │
          ▼
      Bookmark
```

The `Bookmark.folderId` field references `Folder.id`.

Deleting a folder cascades to its bookmarks.

---

# Database Indexes

The database contains indexes supporting common query patterns.

### Folder

```text
createdAt
```

### Bookmark

```text
folderId
title
createdAt
```

These indexes support:

- Folder filtering
- Title search
- Ordering
- Cursor pagination

---

# Cursor Pagination Design

Bookmark pagination uses a cursor containing:

```text
createdAt
id
```

Bookmarks are ordered using:

```text
createdAt ASC
id ASC
```

The bookmark ID acts as a deterministic tie-breaker when multiple bookmarks have the same creation timestamp.

The resolver requests one additional record beyond the requested page size.

This allows the API to determine whether another page exists.

The response contains:

```text
items
nextCursor
hasNextPage
```

---

# Testing

The project uses Bun's built-in test runner.

Run all tests:

```bash
bun run test
```

The current test suite contains:

### Validation Tests

`tests/validation.test.ts`

Tests include:

- Valid bookmark input
- Invalid URL
- Empty title
- Maximum tag limit

### Resolver Tests

`tests/resolvers.test.ts`

Tests include:

- Invalid bookmark URL
- `BAD_USER_INPUT` error handling
- Empty folder ID

### PostgreSQL Integration Tests

`tests/integration.test.ts`

Tests include:

- Creating and reading a bookmark using PostgreSQL
- Loading bookmarks through the folder relationship

The integration tests use the real PostgreSQL database running through Docker.

---

# Type Checking

Run:

```bash
bun run typecheck
```

The command runs:

```text
tsc --noEmit
```

The project should complete type checking without errors.

---

# Development Commands

Install dependencies:

```bash
bun install
```

Start PostgreSQL:

```bash
docker compose up -d
```

Check containers:

```bash
docker ps
```

Run Prisma migrations:

```bash
bunx prisma migrate dev
```

Generate Prisma Client:

```bash
bunx prisma generate
```

Start development server:

```bash
bun run dev
```

Start server without watch mode:

```bash
bun run start
```

Run type checking:

```bash
bun run typecheck
```

Run all tests:

```bash
bun run test
```

Stop PostgreSQL:

```bash
docker compose down
```

---

# Production Considerations

For a production deployment, the following should be considered:

- Use managed PostgreSQL instead of a local Docker database
- Store database credentials in a secure secret manager
- Configure environment-specific variables
- Use appropriate database connection pooling
- Add structured application logging
- Add health checks
- Add API rate limiting
- Configure GraphQL request limits
- Run database migrations as part of deployment
- Add CI/CD automation
- Run type checking and tests in CI
- Configure HTTPS
- Apply appropriate network and database security controls
- Add application monitoring and alerting

Authentication and authorization are outside the current implementation scope.

Redis, GraphQL Federation, and unrelated infrastructure are also outside the current project scope.

---

# Verification

The project should pass both type checking and automated tests before committing changes.

Run:

```bash
bun run typecheck
```

Then:

```bash
bun run test
```

Expected test result for the current implementation:

```text
9 pass
0 fail
```

---

# License

This project was created as part of a technical assignment.