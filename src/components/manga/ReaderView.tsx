
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Zap, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import FlagBadge from '../ui/FlagBadge';
import { MangaSource } from '@/types/manga';

interface ReaderViewProps {
  images: string[];
  mangaTitle: string;
  chapterNum: string;
  source: MangaSource;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function ReaderView({ images, mangaTitle, chapterNum, source, onPrev, onNext }: ReaderViewProps) {
  const router = useRouter();
  const [zoom, setZoom] = useState(1);
  const [showUI, setShowUI] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleZoom = () => {
    setZoom(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1);
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden">
      {/* Dev Info Badge */}
      <div className="fixed bottom-24 left-6 z-[120] pointer-events-none">
        <div className="px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg text-[7px] font-black uppercase tracking-widest text-neutral-500 shadow-2xl">
          [ SOURCE: {source.toUpperCase()} | IMAGES: {images.length} | STATUS: OK ]
        </div>
      </div>

      {/* Top Header */}
      <AnimatePresence>
        {showUI && (
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 inset-x-0 h-16 bg-black/80 backdrop-blur-2xl border-b border-white/5 z-[110] flex items-center justify-between px-6"
          >
            <button 
              onClick={() => router.back()}
              className="p-3 bg-white/5 rounded-2xl hover:bg-accent/20 transition-all text-white"
              aria-label="Back to Series"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 text-center mx-4">
              <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-glow text-accent truncate">
                {mangaTitle}
              </h1>
              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">
                Chapter {chapterNum} / {images.length} Pages
              </p>
            </div>

            <FlagBadge source={source} size="sm" />
          </motion.header>
        )}
      </AnimatePresence>

      {/* Reader Main Stream */}
      <main 
        className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar pb-32"
        onClick={() => setShowUI(!showUI)}
      >
        <motion.div 
          className="flex flex-col items-center w-full origin-top"
          animate={{ scale: zoom }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {images.map((url, i) => (
            <ReaderImage key={i} url={url} index={i} />
          ))}
          
          {images.length === 0 && (
            <div className="h-screen flex flex-col items-center justify-center p-10 text-center space-y-6">
              <AlertTriangle className="w-12 h-12 text-red-500/20" />
              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-tight">Stream Empty</h3>
                <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">No images found in this chapter signal.</p>
              </div>
              <button onClick={() => window.location.reload()} className="px-10 py-3 bg-accent text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Retry Sync</button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Floating Controls */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 inset-x-0 flex items-center justify-center gap-4 z-[110]"
          >
            <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl">
              <button 
                onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
                disabled={!onPrev}
                className="p-4 rounded-2xl hover:bg-white/10 disabled:opacity-20 text-white transition-all"
                aria-label="Previous Chapter"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="h-8 w-px bg-white/10 mx-2" />
              
              <button 
                onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
                className="p-4 rounded-2xl bg-accent text-white shadow-lg shadow-accent/20 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
                aria-label="Toggle Zoom"
              >
                <Zap className="w-4 h-4" /> {zoom}X
              </button>

              <div className="h-8 w-px bg-white/10 mx-2" />

              <button 
                onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                disabled={!onNext}
                className="p-4 rounded-2xl hover:bg-white/10 disabled:opacity-20 text-white transition-all"
                aria-label="Next Chapter"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Frame Node with Error Boundary
 */
function ReaderImage({ url, index }: { url: string; index: number }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(false);
    setLoading(true);
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="relative w-full max-w-3xl min-h-[400px] flex items-center justify-center border-y border-white/5">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-neutral-900/10">
          <Loader2 className="w-6 h-6 text-accent/20 animate-spin" />
          <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest">Loading Frame {index + 1}</span>
        </div>
      )}

      {error ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500/40" />
          <div className="space-y-1">
             <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Frame Sync Failed</p>
             <p className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest">Network Interruption</p>
          </div>
          <button 
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Tap to Retry
          </button>
        </div>
      ) : (
        <img 
          src={url + (retryCount > 0 ? `?retry=${retryCount}` : '')}
          alt={`Page ${index + 1}`}
          className={cn(
            "w-full h-auto block select-none transition-opacity duration-700",
            loading ? "opacity-0" : "opacity-100"
          )}
          loading="lazy"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      )}
      
      {!loading && !error && (
        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[7px] font-black text-neutral-500 uppercase tracking-widest border border-white/5">
          {index + 1}
        </div>
      )}
    </div>
  );
}
