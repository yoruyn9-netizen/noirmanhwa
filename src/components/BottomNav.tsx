
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

// 🔒 NAVBAR LOCKED - UPDATED FOR ADAPTIVE TRANSPARENCY & HIDE SYSTEM
/**
 * Bottom Navigation component with adaptive transparency and global hide protocol.
 * Floating pill-shaped bar that reacts to the system's "Sheet" states.
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
  const { isGlobalUIVisible, isOpen, checkAuth: syncStore } = useUIStore();
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Navbar is hidden if global visibility is off OR if any panel is open (e.g. Filters, Profile Editor)
  const isVisible = isGlobalUIVisible && !isOpen;

  return (
    <nav className={cn(
      "fixed bottom-6 left-0 right-0 z-[100] px-3 flex justify-center pointer-events-none select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"
    )}>
      <div className="bg-[#0a0a0f]/60 backdrop-blur-2xl border border-white/5 rounded-full p-1 flex items-center gap-0.5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] pointer-events-auto ring-1 ring-white/5 max-w-full overflow-hidden">
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
                  ? "bg-white/10 text-white shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]" 
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
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-accent rounded-full animate-in zoom-in duration-700 shadow-[0_0_8px_rgba(139,92,246,0.6)] will-change-transform" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
