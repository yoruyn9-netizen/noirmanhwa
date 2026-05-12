
"use client";

import React from 'react';
import { Home, Search, Bookmark, Grid, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { id: 'home', icon: Home, label: 'HOME', path: '/' },
    { id: 'search', icon: Search, label: 'SEARCH', path: '/search' },
    { id: 'bookmark', icon: Bookmark, label: 'BOOKS', path: '/bookmarks' },
    { id: 'genre', icon: Grid, label: 'GENRE', path: '/genre' },
    { id: 'profile', icon: User, label: 'PROFILE', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 px-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-auto min-w-[300px] transition-all duration-500">
      <div className="flex justify-around items-center h-14 md:h-16 gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 transition-all duration-300 py-1.5 px-3 rounded-full group",
                isActive ? "text-accent" : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-all duration-500", 
                isActive && "scale-110 drop-shadow-[0_0_10px_rgba(153,27,27,0.8)]"
              )} />
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.15em] mt-1 transition-all duration-300",
                isActive ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-accent shadow-[0_0_10px_rgba(153,27,27,1)] rounded-full animate-in fade-in zoom-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
