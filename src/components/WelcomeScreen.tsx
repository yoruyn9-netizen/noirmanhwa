
"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useUIStore } from '@/store/ui';

export default function WelcomeScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const { setGlobalUIVisible } = useUIStore();

  useEffect(() => {
    // Hide global UI immediately when welcome screen starts
    setGlobalUIVisible(false);

    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setVisible(false);
        // Restore global UI visibility once welcome screen is completely gone
        setGlobalUIVisible(true);
      }, 800);
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [setGlobalUIVisible]);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020205] transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative space-y-6 text-center animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/20 shadow-[0_0_50px_rgba(99,102,241,0.2)] animate-pulse">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-glow-intense text-white">
            Noir Manhwa
          </h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] opacity-80">
            Welcome to the Node
          </p>
        </div>
        
        <div className="pt-10 flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
      
      <div className="absolute bottom-10 text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
        Establishing neural transmission...
      </div>
    </div>
  );
}
