<div align="center">

<!-- Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=1e40af&height=200&section=header&text=Bookmark%20Manager&fontSize=56&fontColor=ffffff&fontAlignY=38&desc=Organize%20%E2%80%A2%20Search%20%E2%80%A2%20Manage&descAlignY=58&descSize=20&animation=fadeIn" width="100%" />

<br/>

<!-- Badges -->
<p>
  <img src="https://img.shields.io/badge/Bun-1.x-000000?style=for-the-badge&logo=bun&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/GraphQL-Yoga-E10098?style=for-the-badge&logo=graphql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>
<p>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Bun%20Test-Automated-000000?style=for-the-badge&logo=bun&logoColor=white" />
  <img src="https://img.shields.io/badge/Cursor-Pagination-yellowgreen?style=for-the-badge" />
</p>

<br/>

> **A production-minded Bookmark Manager GraphQL API —**  
> organize bookmarks into folders, search and filter with cursor-based pagination, and manage everything through a single schema-first GraphQL endpoint.

<br/>

[🚀 GraphQL Endpoint](#-graphql-api) &nbsp;•&nbsp; [📖 API Docs](#-graphql-api) &nbsp;•&nbsp; [🐛 Report Bug](https://github.com/pranavreddy1721/bookmark-manager/issues)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🗂️ Project Structure](#️-project-structure)
- [🗄️ Database Schema](#️-database-schema)
- [🔌 GraphQL API](#-graphql-api)
- [📄 Bookmark Pagination](#-bookmark-pagination)
- [✅ Validation & Error Handling](#-validation--error-handling)
- [⚙️ Environment Variables](#️-environment-variables)
- [🚀 Getting Started](#-getting-started)
- [🧪 Testing](#-testing)
- [🔮 How I'd Extend This](#-how-id-extend-this)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📁 Folders
- Create folders to organize bookmarks
- `folders` query — list all folders
- `folder(id)` query — single folder with nested bookmarks
- Folder deletion cascades to its bookmarks

</td>
<td width="50%">

### 🔖 Bookmarks
- Full CRUD — create, update, delete
- `moveBookmark` — move a bookmark between folders
- Tags stored as a string array per bookmark
- Every bookmark belongs to exactly one folder

</td>
</tr>
<tr>
<td width="50%">

### 🔍 Search & Filtering
- Case-insensitive substring search by title
- Filter bookmarks by `folderId`
- Search and folder filtering can be combined
- Filters compose cleanly with pagination

</td>
<td width="50%">

### 📄 Cursor Pagination
- `first` / `after` cursor-based pagination
- Cursor encodes `createdAt` + `id` as tie-breaker
- Fetches `n + 1` records to compute `hasNextPage`
- Works correctly across repeated requests

</td>
</tr>
<tr>
<td width="50%">

### ✅ Validation
- Rejects empty / whitespace-only titles
- Rejects malformed or invalid URLs
- Tag limits — max 20 tags, 50 chars each
- Meaningful `BAD_USER_INPUT` GraphQL errors

</td>
<td width="50%">

### 🧪 Testing
- Unit tests for resolvers with real assertions
- Dedicated validation test suite
- Integration tests against real PostgreSQL
- Type checking via `tsc --noEmit`

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### ⚙️ Runtime & API

| Technology | Purpose |
|---|---|
| **Bun** | JavaScript/TypeScript runtime |
| **TypeScript (strict)** | Type-safe application code, no `any` |
| **GraphQL Yoga** | Schema-first GraphQL server |
| **GraphQL (SDL)** | Schema defined in `schema.ts`, resolvers implemented separately |

### 🗄️ Database

| Technology | Purpose |
|---|---|
| **PostgreSQL** | Relational database |
| **Prisma** | ORM, migrations, and type-safe query access |
| **Docker Compose** | Local PostgreSQL environment |

### 🧪 Testing

| Technology | Purpose |
|---|---|
| **Bun Test** | Built-in test runner for unit + integration tests |

---

## 🗂️ Project Structure

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
│   │   ├── schema.graphql        # GraphQL SDL (types, queries, mutations)
│   │   └── resolvers.ts          # Resolver implementations
│   ├── lib/
│   │   └── prisma.ts             # Prisma client singleton
│   ├── validation/
│   │   └── bookmark.ts           # Title / URL / tag validation
│   └── server.ts                 # GraphQL Yoga server entry point
│
├── tests/
│   ├── validation.test.ts        # Unit tests — input validation
│   ├── resolvers.test.ts         # Unit tests — resolver behavior
│   └── integration.test.ts       # Integration tests — real PostgreSQL
│
├── .env
├── docker-compose.yml
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

---

## 🗄️ Database Schema

### 📁 Folder
```
Folder {
  id         String   — Primary key
  name       String   — Unique
  createdAt  DateTime
  updatedAt  DateTime
  bookmarks  Bookmark[]  — One-to-many relation
}
```

### 🔖 Bookmark
```
Bookmark {
  id         String   — Primary key
  title      String   — Required, non-empty
  url        String   — Required, must be a valid URL
  tags       String[] — Max 20 tags, 50 chars each
  folderId   String   → Folder.id
  createdAt  DateTime
  updatedAt  DateTime
}
```

### 🔗 Relationships

```text
Folder
  │
  └── has many
          │
          ▼
      Bookmark
```

`Bookmark.folderId` references `Folder.id`. Deleting a folder cascades to its bookmarks.

### 📊 Indexes

| Model | Indexed fields |
|---|---|
| **Folder** | `createdAt` |
| **Bookmark** | `folderId`, `title`, `createdAt` |

These support folder filtering, title search, ordering, and cursor pagination.

---

## 🔌 GraphQL API

The GraphQL endpoint is:

```text
POST http://localhost:4000/graphql
```

### Queries

| Query | Description |
|---|---|
| `folders` | Returns all folders |
| `folder(id)` | Returns a single folder with its nested bookmarks |
| `bookmarks(folderId?, search?, first?, after?)` | Returns bookmarks with optional folder filtering, title search, and cursor pagination |

#### Query Folders

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

#### Query a Single Folder

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

### Mutations

| Mutation | Description |
|---|---|
| `createFolder` | Create a new folder |
| `updateFolder` | Rename an existing folder |
| `deleteFolder` | Delete a folder and its bookmarks |
| `createBookmark` | Create a new bookmark inside a folder |
| `updateBookmark` | Update an existing bookmark's fields |
| `deleteBookmark` | Delete a bookmark |
| `moveBookmark(id, folderId)` | Move an existing bookmark to another folder |

#### Create Folder

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

#### Create Bookmark

```graphql
mutation {
  createBookmark(
    title: "Bun Documentation"
    url: "https://bun.sh/docs"
    tags: ["bun", "typescript", "development"]
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

#### Update Bookmark

```graphql
mutation {
  updateBookmark(
    id: "BOOKMARK_ID"
    title: "Bun Documentation Updated"
    url: "https://bun.sh/docs/runtime"
    tags: ["bun", "runtime", "typescript"]
  ) {
    id
    title
    url
    tags
    folderId
    updatedAt
  }
}
```

#### Move Bookmark

```graphql
mutation {
  moveBookmark(id: "BOOKMARK_ID", folderId: "NEW_FOLDER_ID") {
    id
    title
    folderId
    updatedAt
  }
}
```

#### Delete Bookmark

```graphql
mutation {
  deleteBookmark(id: "BOOKMARK_ID")
}
```

---

## 📄 Bookmark Pagination

Bookmarks use **cursor-based pagination**.

| Argument | Description |
|---|---|
| `first` | Number of records to return |
| `after` | Cursor to resume from (returned as `nextCursor`) |

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
    }
    nextCursor
    hasNextPage
  }
}
```

When `hasNextPage` is `true`, pass `nextCursor` as `after` on the next request:

```graphql
query {
  bookmarks(first: 10, after: "NEXT_CURSOR") {
    items {
      id
      title
      url
    }
    nextCursor
    hasNextPage
  }
}
```

**How it works:** the cursor encodes `createdAt` + `id`. Records are ordered `createdAt ASC, id ASC`, with `id` acting as a deterministic tie-breaker when timestamps collide. The resolver fetches one extra record beyond the requested page size to determine `hasNextPage` without a separate count query. Search and folder filtering compose with pagination — both can be combined with `first`/`after` in the same request.

### Filtering

```graphql
query {
  bookmarks(first: 10, folderId: "FOLDER_ID", search: "documentation") {
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

`search` performs a case-insensitive substring match against bookmark titles.

---

## ✅ Validation & Error Handling

Bookmark creation and updates validate:

| Field | Rule |
|---|---|
| `title` | Required, non-empty, not whitespace-only, ≤ 200 chars |
| `url` | Required, must be a well-formed URL |
| `folderId` | Required, non-empty; referenced folder must exist |
| `tags` | Max 20 tags, each ≤ 50 chars, no empty tags |

### Error Codes

| Code | Used for |
|---|---|
| `BAD_USER_INPUT` | Invalid URL, empty title, empty folder ID, too many/invalid tags, invalid pagination cursor or size |
| `NOT_FOUND` | Bookmark not found, folder not found, moving a bookmark to a non-existent folder |

```json
{
  "errors": [
    {
      "message": "URL must be valid",
      "extensions": { "code": "BAD_USER_INPUT" }
    }
  ],
  "data": null
}
```

Validation and expected resource errors return structured GraphQL errors with specific error codes instead of exposing raw database errors.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bookmark_manager?schema=public"
```

The application reads `DATABASE_URL` to connect to PostgreSQL.

> ⚠️ **Never commit `.env` files to Git.**

---

## 🚀 Getting Started

### Prerequisites

```bash
bun --version    # latest
docker --version
```

### 1. Clone the repository

```bash
git clone https://github.com/pranavreddy1721/bookmark-manager.git
cd bookmark-manager
```

### 2. Install dependencies

```bash
bun install
```

### 3. Start PostgreSQL

```bash
docker compose up -d
docker ps   # confirm the container is healthy
```

The database is exposed on `localhost:5432`.

### 4. Set up the database

```bash
bunx prisma migrate dev
bunx prisma generate
```

### 5. Start the server

```bash
bun run dev
```

The GraphQL API is available at:

```text
http://localhost:4000/graphql
```

### Production-style start

```bash
bun run start
```

Runs without watch mode. Default port is `4000`, configurable via `PORT`.

---

## 🧪 Testing

Run all tests:

```bash
bun run test
```

| Suite | File | Covers |
|---|---|---|
| **Validation** | `tests/validation.test.ts` | Valid input, invalid URL, empty title, max tag limit |
| **Resolvers** | `tests/resolvers.test.ts` | Invalid bookmark URL, `BAD_USER_INPUT` handling, empty folder ID |
| **Integration** | `tests/integration.test.ts` | Real PostgreSQL create/read, nested folder → bookmark loading |

Integration tests run against the actual PostgreSQL instance started via Docker — not mocked.

### Type Checking

```bash
bun run typecheck
```

Runs `tsc --noEmit`; the project completes without errors.

Expected result before committing:

```text
bun run typecheck   →  no errors
bun run test        →  9 pass, 0 fail
```

---

## 🔮 How I'd Extend This

If this evolved into a larger production system:

| Area | Direction |
|---|---|
| **Authentication** | Add JWT-based auth so bookmarks/folders are scoped per user |
| **Authorization** | Role-based access if the app grows shared/team folders |
| **Caching** | Cache hot `folders`/`bookmarks` queries (e.g. Redis) with targeted invalidation on writes |
| **Search** | Move from case-insensitive substring search to full-text search (Postgres `tsvector` or a dedicated search index) |
| **Observability** | Structured logging, request tracing, and metrics on resolver latency |
| **API Versioning** | Schema evolution strategy — deprecation directives before breaking changes |
| **Scaling** | Connection pooling (e.g. PgBouncer), read replicas, and horizontal scaling of the API layer |

These are intentionally **not implemented** — the current scope stays focused on the core folder/bookmark GraphQL API, cursor pagination, validation, and testing as specified.

---

## 🤝 Contributing

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m 'feat: add AmazingFeature'

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

---

## 📄 License

This project was created as part of a technical assignment.

<div align="center">

**Built with ❤️ by [Pranav Reddy](https://github.com/pranavreddy1721)**

<img src="https://capsule-render.vercel.app/api?type=waving&color=1e40af&height=100&section=footer" width="100%" />

</div>
