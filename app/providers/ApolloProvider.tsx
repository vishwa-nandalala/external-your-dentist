// app/providers/ApolloProvider.tsx

"use client";

import { ApolloProvider as ApolloClientProvider } from "@apollo/client/react";
import { getApolloClient } from "@/lib/apollo/client";

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const client = getApolloClient();
  
  return (
    <ApolloClientProvider client={client}>
      {children}
    </ApolloClientProvider>
  );
}