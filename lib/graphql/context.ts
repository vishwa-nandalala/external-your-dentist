// lib/graphql/context.ts
// GraphQL Context - Passed to every resolver for auth, data sources, etc.

export interface GraphQLContext {
  /**
   * Authenticated user ID from the request, if any.
   */
  userId?: string;

  /**
   * Bearer token from the Authorization header, if present.
   */
  token?: string;

  /**
   * Request headers (read-only).
   */
  headers: Headers;
}

/**
 * Build the GraphQL context from an incoming Request.
 * Called once per GraphQL operation.
 */
export async function createContext(request: Request): Promise<GraphQLContext> {
  const headers = request.headers;
  const authorization = headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : undefined;

  // TODO: Verify the token and extract userId
  // Example:
  // const userId = token ? await verifyToken(token) : undefined;

  return {
    token,
    headers,
  };
}
