# GraphService API — Implementation Skills

---

## 1. Project Setup

- Initialize Node.js project with `npm init -y`
- Install core dependencies:
  - `apollo-server` (or `@apollo/server` v4)
  - `graphql`
  - `typescript`
  - `prisma` and `@prisma/client`
  - `ts-node`, `ts-node-dev` (dev)
  - `@types/node` (dev)
- Configure `tsconfig.json` with strict mode, ES module interop, and output to `dist/`
- Add npm scripts: `dev`, `build`, `start`, `prisma:generate`, `prisma:migrate`

---

## 2. Project Structure

```
GraphServiceAPI/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts              # Apollo Server entry point
│   ├── schema/
│   │   ├── typeDefs.ts       # GraphQL type definitions
│   │   └── resolvers/
│   │       └── index.ts      # Root resolver map
│   ├── services/
│   │   └── userService.ts    # Business logic layer
│   ├── repositories/
│   │   └── userRepository.ts # Data access layer (Prisma calls)
│   └── utils/
│       └── prismaClient.ts   # Singleton Prisma client
├── tsconfig.json
├── package.json
├── .env
├── .gitignore
├── README.md
└── skills.md
```

---

## 3. Database Layer (Prisma + PostgreSQL)

- Initialize Prisma: `npx prisma init`
- Configure `prisma/schema.prisma` with PostgreSQL datasource
- Define initial models (e.g., `User`, `Post`) with relations
- Run migrations: `npx prisma migrate dev --name init`
- Generate Prisma client: `npx prisma generate`
- Create a singleton `PrismaClient` instance in `src/utils/prismaClient.ts`

### Example Model

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 4. Repository Layer

- Each repository file wraps Prisma client calls for a specific model
- Repositories handle all direct database operations (CRUD)
- No business logic — only data access

### Responsibilities

| Method          | Description                  |
|-----------------|------------------------------|
| `findAll()`     | Fetch all records            |
| `findById(id)`  | Fetch a single record by ID  |
| `create(data)`  | Insert a new record          |
| `update(id, data)` | Update an existing record |
| `delete(id)`    | Remove a record              |

---

## 5. Service Layer

- Each service file contains business logic for a domain
- Services call repositories — never Prisma directly
- Validate inputs, apply business rules, orchestrate operations
- Services are called by resolvers

### Pattern

```typescript
import { userRepository } from "../repositories/userRepository";

export const userService = {
  getAllUsers: () => userRepository.findAll(),
  getUserById: (id: number) => userRepository.findById(id),
  createUser: (data: { email: string; name?: string }) => {
    // Business validation can go here
    return userRepository.create(data);
  },
  // ...
};
```

---

## 6. GraphQL Schema (Type Definitions)

- Define types, queries, and mutations in `src/schema/typeDefs.ts`
- Use SDL (Schema Definition Language)

### Example

```graphql
type User {
  id: Int!
  email: String!
  name: String
  posts: [Post!]!
  createdAt: String!
  updatedAt: String!
}

type Post {
  id: Int!
  title: String!
  content: String
  published: Boolean!
  author: User!
  createdAt: String!
  updatedAt: String!
}

type Query {
  users: [User!]!
  user(id: Int!): User
  posts: [Post!]!
  post(id: Int!): Post
}

type Mutation {
  createUser(email: String!, name: String): User!
  updateUser(id: Int!, email: String, name: String): User!
  deleteUser(id: Int!): User!
  createPost(title: String!, content: String, authorId: Int!): Post!
  updatePost(id: Int!, title: String, content: String, published: Boolean): Post!
  deletePost(id: Int!): Post!
}
```

---

## 7. Resolvers

- Resolvers map GraphQL operations to service layer calls
- Keep resolvers thin — delegate to services
- Handle errors and return appropriate responses

### Pattern

```typescript
import { userService } from "../../services/userService";

export const userResolvers = {
  Query: {
    users: () => userService.getAllUsers(),
    user: (_: unknown, args: { id: number }) => userService.getUserById(args.id),
  },
  Mutation: {
    createUser: (_: unknown, args: { email: string; name?: string }) =>
      userService.createUser(args),
  },
};
```

---

## 8. Apollo Server Entry Point

- Create and start Apollo Server in `src/index.ts`
- Pass `typeDefs` and `resolvers`
- Use `@apollo/server` v4 standalone or with Express

### Example

```typescript
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./schema/resolvers";

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
```

---

## 9. Environment & Configuration

- Use `.env` for secrets (`DATABASE_URL`)
- Add `.env` to `.gitignore`
- Prisma reads `DATABASE_URL` automatically from `.env`

### `.env`

```
DATABASE_URL="postgresql://user:password@localhost:5432/graphservice?schema=public"
```

### `.gitignore`

```
node_modules/
dist/
.env
```

---

## 10. Implementation Order

1. **Initialize project** — `npm init`, install deps, configure TypeScript
2. **Set up Prisma** — init, define schema, run migration, generate client
3. **Create Prisma client singleton** — `src/utils/prismaClient.ts`
4. **Build repository layer** — `userRepository.ts`, `postRepository.ts`
5. **Build service layer** — `userService.ts`, `postService.ts`
6. **Define GraphQL schema** — `typeDefs.ts`
7. **Write resolvers** — wire to services
8. **Create server entry point** — `src/index.ts`
9. **Test with GraphQL Playground** — verify queries and mutations
10. **Add error handling** — consistent error responses

---

## 11. Key Principles

- **Separation of concerns**: Resolver → Service → Repository → Prisma
- **Single responsibility**: each file/module owns one concern
- **No Prisma in resolvers or services**: only repositories touch the ORM
- **Strong typing**: leverage TypeScript and Prisma-generated types throughout
- **Thin resolvers**: resolvers only route — no logic
