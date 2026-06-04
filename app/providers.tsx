"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { queryClient } from "@/src/shared/api/query-client";
import { ThemeProvider } from "@/src/shared/theme";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => queryClient);

  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
