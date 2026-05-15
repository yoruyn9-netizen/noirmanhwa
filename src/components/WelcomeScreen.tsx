
"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, ShieldCheck } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import Image from 'next/image';
import placeholderData from '@/lib/placeholder-images.json';

export default function WelcomeScreen() {
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState(0); // 0: Enter, 1: Loading, 2: Exit
  const { setGlobalUIVisible } = useUIStore();
  
  const chibiData = placeholderData.placeholderImages.find(img => img.id === 'welcome-chibi');

  useEffect(() => {
    // Session-based check to prevent repeat animations
    const hasBeenShown = sessionStorage.getItem('noir_welcome_sequence');
    
    if (hasBeenShown) {
      setVisible(false);
      setGlobalUIVisible(true);
      return;
    }

    setVisible(true);
    setGlobalUIVisible(false);

    // Timeline Sequence
    const timer1 = setTimeout(() => setStage(1), 800);
    const timer2 = setTimeout(() => setStage(2), 3500);
    const timer3 = setTimeout(() => {
      setVisible(false);
      setGlobalUIVisible(true);
      sessionStorage.setItem('noir_welcome_sequence', 'true');
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [setGlobalUIVisible]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 2 ? 0 : 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#020205] overflow-hidden"
      >
        {/* Dynamic Background Matrix */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-transparent pointer-events-none" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[160px]"
        />

        <div className="relative space-y-10 text-center flex flex-col items-center">
          {/* Character Portal */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="relative group"
          >
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center relative z-10 overflow-hidden shadow-2xl">
              <Image 
                src={chibiData?.imageUrl || "https://picsum.photos/seed/violet/400/400"}
                alt="System Guide"
                width={400}
                height={400}
                className="w-full h-full object-cover brightness-110"
                data-ai-hint={chibiData?.imageHint}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-40" />
            </div>
            
            {/* Orbital Rings */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-accent/20 rounded-[4rem] border-dashed opacity-40"
            />
            <div className="absolute inset-0 bg-accent/10 rounded-[3rem] blur-2xl animate-pulse" />
          </motion.div>
          
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-1"
            >
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-glow-intense text-white">
                Noir Manhwa
              </h1>
              <div className="flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-accent/40" />
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.6em]">
                  Uplink Active
                </p>
                <span className="h-px w-8 bg-accent/40" />
              </div>
            </motion.div>
            
            {/* Status Feedback */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-col items-center gap-3 pt-6"
            >
              <div className="flex items-center gap-4 px-6 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <Terminal className="w-3.5 h-3.5 text-accent animate-pulse" />
                <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest min-w-[140px]">
                  {stage === 0 ? "Initializing Signal..." : stage === 1 ? "Synchronizing Archive..." : "Neural Link Established"}
                </span>
                <ShieldCheck className={stage === 2 ? "w-3.5 h-3.5 text-green-500" : "w-3.5 h-3.5 text-neutral-800"} />
              </div>

              {/* Progress Bar Container */}
              <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: stage >= 1 ? "100%" : "30%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className="h-full bg-accent shadow-[0_0_10px_rgba(139,92,246,0.6)]"
                />
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <p className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.3em]">
            System Online • Protocol 42
          </p>
          <div className="flex gap-1.5">
             <div className="w-1 h-1 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
             <div className="w-1 h-1 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
             <div className="w-1 h-1 rounded-full bg-accent animate-bounce" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
