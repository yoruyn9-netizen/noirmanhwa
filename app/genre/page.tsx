
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ChevronRight, 
  Sword, 
  Map, 
  Wand2, 
  RefreshCw, 
  Ghost, 
  Cpu, 
  Zap, 
  Heart, 
  Laugh,
  Component
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GENRES = [
  { name: "Action", icon: Sword, color: "from-red-500/20" },
  { name: "Adventure", icon: Map, color: "from-emerald-500/20" },
  { name: "Fantasy", icon: Wand2, color: "from-purple-500/20" },
  { name: "Reincarnation", icon: RefreshCw, color: "from-cyan-500/20" },
  { name: "Isekai", icon: Ghost, color: "from-blue-500/20" },
  { name: "System", icon: Cpu, color: "from-indigo-500/20" },
  { name: "Martial Arts", icon: Zap, color: "from-orange-500/20" },
  { name: "Magic", icon: Sparkles, color: "from-yellow-500/20" },
  { name: "Romance", icon: Heart, color: "from-pink-500/20" },
  { name: "Comedy", icon: Laugh, color: "from-lime-500/20" },
  { name: "Drama", icon: Component, color: "from-slate-500/20" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function GenrePage() {
  const router = useRouter();

  return (
    <div className="space-y-16 max-w-5xl mx-auto pb-32 pt-10 px-4 relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center space-y-6"
      >
        <div className="relative group">
          <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] border border-accent/20 flex items-center justify-center shadow-2xl transition-transform duration-700 group-hover:scale-110">
            <Sparkles className="w-10 h-10 text-accent animate-pulse" />
          </div>
          <div className="absolute inset-0 bg-accent/10 rounded-[2.5rem] blur-xl -z-10 opacity-50" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-glow leading-none">Category Matrix</h1>
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.5em] opacity-80">Filter signal by narrative type</p>
        </div>
      </motion.div>

      {/* Genre Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {GENRES.map((genre) => (
          <motion.button 
            key={genre.name}
            variants={itemVariants}
            onClick={() => router.push(`/search?q=${genre.name}`)}
            className={cn(
              "group relative h-44 overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0f]/40 backdrop-blur-3xl transition-all duration-500",
              "hover:border-accent/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            )}
          >
            {/* Dynamic Hover Background */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700",
              genre.color
            )} />

            {/* Content Container */}
            <div className="relative h-full flex flex-col items-center justify-center p-6 space-y-4 z-10">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-accent/10 group-hover:border-accent/20 transition-all duration-500 group-hover:scale-110">
                <genre.icon className="w-6 h-6 text-neutral-500 group-hover:text-accent transition-colors duration-500" />
              </div>
              
              <div className="text-center space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-neutral-300 group-hover:text-white transition-colors">
                  {genre.name}
                </span>
                
                {/* Reveal on Hover prompt */}
                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <span className="text-[7px] font-black text-accent uppercase tracking-widest">Connect</span>
                  <ChevronRight className="w-2.5 h-2.5 text-accent" />
                </div>
              </div>
            </div>

            {/* Bottom Glow Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent/20 rounded-full group-hover:w-12 group-hover:bg-accent transition-all duration-700 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          </motion.button>
        ))}
      </motion.div>

      {/* Footer Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center pt-10"
      >
        <p className="text-[8px] font-bold text-neutral-700 uppercase tracking-[0.6em] opacity-40">System Nodes Synchronized • 11 Categories Loaded</p>
      </motion.div>
    </div>
  );
}
