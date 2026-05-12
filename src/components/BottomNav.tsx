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
    { id: 'home', icon: Home, label: 'Home', action: () => { router.push('/'); closePanel(); } },
    { id: 'search', icon: Search, label: 'Search', action: () => openPanel('search') },
    { id: 'bookmark', icon: Bookmark, label: 'Books', action: () => openPanel('bookmark') },
    { id: 'genre', icon: Grid, label: 'Genre', action: () => openPanel('genre') },
    { id: 'profile', icon: User, label: 'Profile', action: () => openPanel('profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 pb-safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = (item.id === 'home' && pathname === '/' && !isOpen) || 
                           (activePanel === item.id && isOpen);
          
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={cn(
                "relative flex flex-col items-center justify-center w-full transition-all duration-300",
                isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6 mb-1 transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-1 w-8 h-0.5 bg-accent shadow-[0_0_8px_rgba(185,28,28,0.8)] rounded-full animate-in fade-in zoom-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}