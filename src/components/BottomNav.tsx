
"use client";

import React from 'react';
import { Home, Search, Bookmark, Grid, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUIStore } from '@/store/ui';

export default function BottomNav() {
  const pathname = usePathname();
  const { isGlobalUIVisible } = useUIStore();

  const navItems = [
    { id: 'home', icon: Home, label: 'HOME', path: '/' },
    { id: 'search', icon: Search, label: 'SCAN', path: '/search' },
    { id: 'bookmark', icon: Bookmark, label: 'ARCHIVE', path: '/bookmarks' },
    { id: 'genre', icon: Grid, label: 'GENRE', path: '/genre' },
    { id: 'profile', icon: User, label: 'LOGIN', path: '/profile' },
  ];

  return (
    <nav className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#050508]/60 backdrop-blur-2xl rounded-full border border-white/5 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
      !isGlobalUIVisible ? "translate-y-[200%] opacity-0" : "translate-y-0 opacity-100"
    )}>
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "relative flex items-center gap-2 transition-all duration-500 py-3 px-5 rounded-full group overflow-hidden",
                isActive ? "bg-accent/10 text-accent" : "text-neutral-600 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4 transition-all duration-500", 
                isActive && "scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
              )} />
              
              {isActive && (
                <span className="text-[8px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-500">
                  {item.label}
                </span>
              )}
              
              {isActive && (
                <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent shadow-[0_0_10px_rgba(139,92,246,1)] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
