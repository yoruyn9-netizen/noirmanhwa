
"use client";

import React from 'react';
import GlobalChat from '@/components/chat/GlobalChat';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  return (
    <div className="fixed inset-0 z-50 bg-[#020205] flex flex-col animate-in fade-in duration-700">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-[#0a0a0f]/60 backdrop-blur-2xl border-b border-white/5 relative z-10">
        <Link 
          href="/" 
          className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
        </Link>
        
        <div className="text-center">
          <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Public Terminal</h1>
          <p className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest">Verified Connection</p>
        </div>

        <div className="w-11" />
      </header>

      {/* Full Chat Interface */}
      <main className="flex-1 relative z-10 overflow-hidden">
        <GlobalChat previewMode={false} />
      </main>

      {/* Footer System Status */}
      <footer className="h-10 bg-[#0a0a0f] border-t border-white/5 flex items-center justify-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
          <span className="text-[7px] font-black text-neutral-600 uppercase tracking-[0.3em]">Network Online • Alpha Node 42</span>
        </div>
      </footer>
    </div>
  );
}
