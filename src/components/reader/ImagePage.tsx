
"use client";

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { loadImageWithRetry } from '@/lib/mangaDexChapter';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePageProps {
  url: string;
  index: number;
}

export default function ImagePage({ url, index }: ImagePageProps) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '1000px' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (inView && !src) {
      load();
    }
  }, [inView, src]);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const verifiedUrl = await loadImageWithRetry(url);
      setSrc(verifiedUrl);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="relative w-full max-w-3xl min-h-[400px] flex items-center justify-center border-y border-white/5 bg-neutral-900/5">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-6 h-6 text-accent/20 animate-spin" />
          <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest">Syncing Frame {index + 1}</span>
        </div>
      )}

      {error ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500/40" />
          <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Network Interruption</p>
          <button onClick={load} className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase text-white hover:bg-white/10 transition-all">
            <RefreshCw className="w-3 h-3" /> Retry Sync
          </button>
        </div>
      ) : src ? (
        <img 
          src={src} 
          alt={`Page ${index + 1}`}
          className={cn("w-full h-auto block select-none transition-opacity duration-700", loading ? "opacity-0" : "opacity-100")}
          onLoad={() => setLoading(false)}
        />
      ) : null}
      
      {!loading && !error && (
        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[7px] font-black text-neutral-500 uppercase tracking-widest border border-white/5">
          {index + 1}
        </div>
      )}
    </div>
  );
}
