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
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 px-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-auto min-w-[300px] max-w-[95vw] transition-all duration-500 hover:bg-black/60">
      <div className="flex justify-around items-center h-14 md:h-16 gap-1">
        {navItems.map((item) => {
          const isActive = (item.id === 'home' && pathname === '/' && !isOpen) || 
                           (activePanel === item.id && isOpen);
          
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 transition-all duration-300 py-1.5 rounded-full",
                isActive ? "text-accent" : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-all duration-500", 
                isActive && "scale-110 drop-shadow-[0_0_10px_rgba(153,27,27,0.8)]"
              )} />
              <span className={cn(
                "text-[8px] font-bold uppercase tracking-[0.1em] mt-1 transition-opacity duration-300",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-0.5 w-1 h-1 bg-accent shadow-[0_0_10px_rgba(153,27,27,1)] rounded-full animate-in fade-in zoom-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
