
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OwnerBannerProps {
  className?: string;
}

export default function OwnerBanner({ className }: OwnerBannerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative p-4 rounded-2xl border border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-pink-500/10 overflow-hidden group",
        className
      )}
    >
      {/* Sparkles */}
      <motion.div 
        animate={{ opacity: [0.2, 0.8, 0.2] }} 
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
      >
        <Sparkles className="absolute top-2 left-4 w-3 h-3 text-yellow-500/40" />
        <Sparkles className="absolute bottom-2 right-4 w-2 h-2 text-pink-500/40" />
      </motion.div>

      <div className="relative z-10 flex items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-glow text-white">
          OWNER MODE ACTIVE
        </span>
      </div>

      {/* Animated Shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.div>
  );
}
