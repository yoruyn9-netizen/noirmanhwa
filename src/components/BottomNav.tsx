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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 backdrop-blur-2xl rounded-2xl border border-white/10 px-1 shadow-2xl transition-all duration-500">
      <div className="flex justify-around items-center h-11 gap-0.5 px-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center transition-all duration-300 py-1 px-2.5 min-w-[48px] rounded-xl group",
                isActive ? "text-accent" : "text-muted-foreground/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-3.5 h-3.5 transition-all", 
                isActive && "scale-110 drop-shadow-[0_0_5px_rgba(153,27,27,0.5)]"
              )} />
              <span className={cn(
                "text-[7px] font-black uppercase tracking-widest mt-0.5 transition-all duration-300",
                isActive ? "opacity-100" : "opacity-0 transform translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-0.5 w-4 h-0.5 bg-accent shadow-[0_0_8px_rgba(153,27,27,1)] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}