
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Trophy, 
  Bookmark, 
  LayoutGrid, 
  Fingerprint, 
  User 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/authStore';

// 🔒 NAVBAR LOCKED - DO NOT MODIFY STRUCTURE
/**
 * Bottom Navigation component strictly following Picture 22 reference.
 * Floating pill-shaped bar with active item highlighting and revealed labels.
 */
const navItems = [
  { href: '/', icon: Home, label: 'HOME' },
  { href: '/search', icon: Search, label: 'SEARCH' },
  { href: '/top', icon: Trophy, label: 'TOP' },
  { href: '/bookmarks', icon: Bookmark, label: 'LIBRARY' },
  { href: '/genre', icon: LayoutGrid, label: 'GENRES' },
  { href: '/login', icon: Fingerprint, label: 'LOGIN' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { isGlobalUIVisible } = useUIStore();
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isGlobalUIVisible) return null;

  return (
    <nav className="fixed bottom-6 left-0 right-0 z-[100] px-3 flex justify-center pointer-events-none select-none animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="bg-[#050508]/90 backdrop-blur-3xl border border-white/10 rounded-full p-1 flex items-center gap-0.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto ring-1 ring-white/10 max-w-full overflow-hidden">
        {navItems.map(({ href, icon: Icon, label }) => {
          // Identity Logic for Profile vs Login
          let targetHref = href;
          let TargetIcon = Icon;
          let targetLabel = label;
          
          if (label === 'LOGIN' && user) {
            targetHref = '/profile';
            TargetIcon = User;
            targetLabel = 'PROFILE';
          }

          const isActive = pathname === targetHref || (targetHref !== '/' && pathname?.startsWith(targetHref));
          
          return (
            <Link
              key={label}
              href={targetHref}
              className={cn(
                "relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full transition-all duration-500 group whitespace-nowrap",
                isActive 
                  ? "bg-purple-600/15 text-purple-400 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)]" 
                  : "text-neutral-500 hover:text-neutral-400"
              )}
            >
              <TargetIcon 
                size={17} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={cn("transition-transform duration-500 shrink-0", isActive && "scale-105")} 
              />
              
              {isActive && (
                <span className="text-[9px] font-black tracking-[0.15em] uppercase animate-in fade-in slide-in-from-left-2 duration-500">
                  {targetLabel}
                </span>
              )}

              {/* Glowing bar at bottom of pill item */}
              {isActive && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-purple-500 rounded-full animate-in zoom-in duration-700 shadow-[0_0_8px_rgba(168,85,247,0.8)] will-change-transform" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
