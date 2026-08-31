// lib/apollo/client.ts
// Apollo Client for browser-side GraphQL queries

"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "/api/graphql",
});

let browserClient: ApolloClient | undefined;

export function getApolloClient(): ApolloClient {
  if (typeof window === "undefined") {
    // Server-side: always create a new client (no caching across requests)
    return new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
      ssrMode: true,
    });
  }

  // Browser-side: reuse a single client instance
  if (!browserClient) {
    browserClient = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
      ssrMode: false,
    });
  }

  return browserClient;
}
