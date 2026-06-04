import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 0;
        if ([401, 403, 404, 409, 422, 429].includes(status)) return false;
        return failureCount < 2;
      },
    },
  },
});
