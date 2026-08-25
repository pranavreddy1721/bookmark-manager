import { createSchema } from "graphql-yoga";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { resolvers } from "./resolvers.ts";

const typeDefs = readFileSync(
  fileURLToPath(new URL("./schema.graphql", import.meta.url)),
  "utf8",
);

export const schema = createSchema({
  typeDefs,
  resolvers,
});