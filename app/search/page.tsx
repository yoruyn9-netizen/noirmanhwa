import { Suspense } from 'react';
import SearchClientWrapper from '@/components/search/SearchClientWrapper';
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';

function SearchFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <ThreeBodyLoader />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Loading search...</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchClientWrapper />
    </Suspense>
  );
}
