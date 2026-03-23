"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { RoleProvider } from "@/components/app/role";
import { AuthProvider } from "@/hooks/useAuth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <RoleProvider>{children}</RoleProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
