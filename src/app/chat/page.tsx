
"use client";

import React from 'react';
import GlobalChat from '@/components/chat/GlobalChat';
import { ArrowLeft, Terminal } from 'lucide-react';
import Link from 'next/link';

/**
 * Dedicated Full-Screen Chat Route
 */
export default function ChatPage() {
  return (
    <div className="fixed inset-0 z-50 bg-[#020205] flex flex-col animate-in fade-in duration-700">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Control Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-[#0a0a0f]/60 backdrop-blur-2xl border-b border-white/5 relative z-10">
        <Link 
          href="/" 
          className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-accent/10 hover:border-accent/20 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-accent transition-colors" />
        </Link>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-accent" />
            <h1 className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Global Comms Terminal</h1>
          </div>
          <p className="text-[6px] font-bold text-neutral-600 uppercase tracking-widest opacity-60">Frequency: Alpha-Node 42</p>
        </div>

        <div className="w-11" />
      </header>

      {/* Main Terminal Interface */}
      <main className="flex-1 relative z-10 overflow-hidden">
        <GlobalChat previewMode={false} />
      </main>

      {/* System Status Footer */}
      <footer className="h-8 bg-[#0a0a0f] border-t border-white/5 flex items-center justify-between px-6 select-none">
        <span className="text-[6px] font-black text-neutral-700 uppercase tracking-widest">Connection: AES-256 Encrypted</span>
        <div className="flex items-center gap-4">
          <span className="text-[6px] font-black text-accent uppercase tracking-[0.3em]">Signal: Verified</span>
          <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
        </div>
      </footer>
    </div>
  );
}
