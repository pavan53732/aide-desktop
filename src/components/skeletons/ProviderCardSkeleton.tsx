import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function ProviderCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
