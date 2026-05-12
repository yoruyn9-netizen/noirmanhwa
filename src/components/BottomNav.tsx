"use client";

import React from 'react';
import { Home, Search, Bookmark, Grid, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { id: 'home', icon: Home, label: 'HOME', path: '/' },
    { id: 'search', icon: Search, label: 'SEARCH', path: '/search' },
    { id: 'bookmark', icon: Bookmark, label: 'BOOKS', path: '/bookmarks' },
    { id: 'genre', icon: Grid, label: 'GENRE', path: '/genre' },
    { id: 'profile', icon: User, label: 'PROFILE', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 px-1 shadow-2xl w-auto transition-all duration-500">
      <div className="flex justify-around items-center h-12 md:h-14 gap-0.5 px-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center transition-all duration-300 py-1 px-3 min-w-[56px] rounded-xl group",
                isActive ? "text-accent" : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4 transition-all duration-500", 
                isActive && "scale-110 drop-shadow-[0_0_8px_rgba(153,27,27,0.8)]"
              )} />
              <span className={cn(
                "text-[7px] font-black uppercase tracking-[0.1em] mt-1 transition-all duration-300",
                isActive ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-0.5 w-1 h-0.5 bg-accent shadow-[0_0_8px_rgba(153,27,27,1)] rounded-full animate-in fade-in zoom-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
