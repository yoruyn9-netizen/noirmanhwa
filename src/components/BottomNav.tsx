"use client";

import React from 'react';
import { Home, Search, Bookmark, Grid, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'search', icon: Search, label: 'Search', path: '/search' },
    { id: 'bookmark', icon: Bookmark, label: 'Books', path: '/bookmarks' },
    { id: 'genre', icon: Grid, label: 'Genre', path: '/genre' },
    { id: 'profile', icon: User, label: 'Node', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#050508]/40 backdrop-blur-3xl rounded-[2rem] border border-white/5 px-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700">
      <div className="flex justify-around items-center h-12 gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center transition-all duration-500 py-1.5 px-3.5 min-w-[54px] rounded-2xl group",
                isActive ? "text-accent" : "text-muted-foreground/40 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4 transition-all duration-500", 
                isActive && "scale-110 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]"
              )} />
              <span className={cn(
                "text-[7px] font-black uppercase tracking-widest mt-1 transition-all duration-500",
                isActive ? "opacity-100" : "opacity-0 transform translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1 w-5 h-0.5 bg-accent shadow-[0_0_12px_rgba(139,92,246,1)] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
