// app/api/graphql/route.ts
// Apollo Server v4 + Next.js App Router (manual handler)
// The @as-integrations/next package targets Pages Router;
// for the App Router we use ApolloServer.start() + executeHTTPGraphQLRequest().

import { ApolloServer } from "@apollo/server";
import { typeDefs } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";
import { createContext, type GraphQLContext } from "@/lib/graphql/context";

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
});

// Start the server once (module-level singleton)
const serverStarted = server.start();

async function handler(request: Request): Promise<Response> {
  await serverStarted;

  // Apollo Server v4 expects an HTTPGraphQLRequest object
  const httpGraphQLRequest = {
    method: request.method,
    headers: request.headers,
    body: await request.text(),
    search: new URL(request.url).search,
  };

  const result = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest,
    context: async () => createContext(request),
  });

  // Convert Apollo's result to a standard Response
  const headers = new Headers();
  if (result.headers) {
    result.headers.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return new Response(result.body?.string ?? null, {
    status: result.status ?? 200,
    headers,
  });
}

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}
