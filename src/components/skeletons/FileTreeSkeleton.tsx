import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function FileTreeSkeleton() {
  // Use fixed widths to avoid hydration mismatch with Math.random()
  const widths = ['85%', '60%', '75%', '50%', '90%'];
  
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4" style={{ width: widths[i - 1] }} />
        </div>
      ))}
    </div>
  );
}
