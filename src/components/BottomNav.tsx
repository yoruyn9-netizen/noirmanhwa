"use client";

import React from 'react';
import { Home, Search, Bookmark, Grid, User } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const { openPanel, activePanel, closePanel, isOpen } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { id: 'home', icon: Home, label: 'HOME', action: () => { router.push('/'); closePanel(); } },
    { id: 'search', icon: Search, label: 'SEARCH', action: () => openPanel('search') },
    { id: 'bookmark', icon: Bookmark, label: 'BOOKS', action: () => openPanel('bookmark') },
    { id: 'genre', icon: Grid, label: 'GENRE', action: () => openPanel('genre') },
    { id: 'profile', icon: User, label: 'PROFILE', action: () => openPanel('profile') },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl border border-white/5 px-6 shadow-[0_15px_30px_rgba(0,0,0,0.8)] w-[90%] max-w-md pb-safe-area-inset-bottom">
      <div className="flex justify-around items-center h-20">
        {navItems.map((item) => {
          const isActive = (item.id === 'home' && pathname === '/' && !isOpen) || 
                           (activePanel === item.id && isOpen);
          
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={cn(
                "relative flex flex-col items-center justify-center w-full transition-all duration-500 py-2",
                isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6 mb-1.5 transition-all duration-500", isActive && "scale-110 drop-shadow-[0_0_8px_rgba(185,28,28,0.8)]")} />
              <span className="text-[9px] font-black uppercase tracking-[0.15em]">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-1 w-6 h-1 bg-accent shadow-[0_0_15px_rgba(185,28,28,1)] rounded-full animate-in fade-in zoom-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}