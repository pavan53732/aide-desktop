import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { useAppStore } from './stores/appStore';
import './lib/utils/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
    },
  },
});

function App() {
  const { initializeDefaultProviders } = useAppStore();

  useEffect(() => {
    initializeDefaultProviders();
  }, [initializeDefaultProviders]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen w-full overflow-hidden bg-background text-foreground">
        <AppLayout />
        <Toaster position="bottom-right" />
      </div>
    </QueryClientProvider>
  );
}

export default App;