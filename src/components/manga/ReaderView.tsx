
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, ZoomIn, ZoomOut, Zap } from 'lucide-react';
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
    // Hide default header/footer if necessary or handle in layout
  }, []);

  const toggleZoom = () => {
    setZoom(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1);
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden">
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
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 text-center mx-4">
              <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-glow text-accent truncate">
                {mangaTitle}
              </h1>
              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">
                Unit {chapterNum} / {images.length} Nodes
              </p>
            </div>

            <FlagBadge source={source} size="sm" />
          </motion.header>
        )}
      </AnimatePresence>

      {/* Reader Grid */}
      <main 
        className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar pb-20"
        onClick={() => setShowUI(!showUI)}
      >
        <motion.div 
          className="flex flex-col items-center w-full origin-top"
          animate={{ scale: zoom }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {images.map((url, i) => (
            <div key={i} className="relative w-full max-w-3xl group">
              <img 
                src={url} 
                alt={`Page ${i + 1}`}
                className="w-full h-auto block select-none"
                loading="lazy"
              />
              {i === 0 && (
                <div className="absolute top-4 left-4 opacity-40">
                  <FlagBadge source={source} size="sm" className="border-none" />
                </div>
              )}
            </div>
          ))}
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
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="h-8 w-px bg-white/10 mx-2" />
              
              <button 
                onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
                className="p-4 rounded-2xl bg-accent text-white shadow-lg shadow-accent/20 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
              >
                <Zap className="w-4 h-4" /> {zoom}X
              </button>

              <div className="h-8 w-px bg-white/10 mx-2" />

              <button 
                onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                disabled={!onNext}
                className="p-4 rounded-2xl hover:bg-white/10 disabled:opacity-20 text-white transition-all"
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
