// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  // On client: reuse the same client

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
