'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { getQueryClient } from '../api/query-client';
import { AuthProvider } from '@/presentation/features/auth/model/use-auth';
import { ThemeProvider } from '@/shared/components/theme-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Get or create query client
  const queryClient = getQueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
