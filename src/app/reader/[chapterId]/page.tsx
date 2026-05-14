
"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy Redirect Node
 * Consolidates 'chapterId' folder slug with 'id' to resolve Next.js routing collisions.
 * This route redirects any direct chapter link to the unified [id] protocol.
 */
export default function LegacyReaderRedirect({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = use(params);
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to the unified [id] route immediately
    router.replace(`/reader/${chapterId}`);
  }, [chapterId, router]);

  return (
    <div className="fixed inset-0 bg-[#020205] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Re-routing Node Transmission</p>
      </div>
    </div>
  );
}
