import { createYoga } from "graphql-yoga";
import { createServer } from "node:http";

import { schema } from "./graphql/schema.ts";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
});

const server = createServer(yoga);

const port = Number(process.env.PORT ?? 4000);

server.listen(port, () => {
  console.log(`GraphQL server running at http://localhost:${port}/graphql`);
});