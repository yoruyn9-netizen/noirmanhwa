"use client";

import React, { useEffect } from 'react';
import { Home, Search, Bookmark, Grid, User, Fingerprint, Trophy } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/authStore';

export default function BottomNav() {
  const pathname = usePathname();
  const { isGlobalUIVisible } = useUIStore();
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navItems = [
    { id: 'home', icon: Home, label: 'HOME', path: '/' },
    { id: 'search', icon: Search, label: 'SEARCH', path: '/search' },
    { id: 'top', icon: Trophy, label: 'TOP', path: '/top' },
    { id: 'bookmark', icon: Bookmark, label: 'LIBRARY', path: '/bookmarks' },
    { id: 'genre', icon: Grid, label: 'GENRES', path: '/genre' },
    { id: 'profile', icon: user ? User : Fingerprint, label: user ? 'PROFILE' : 'LOGIN', path: user ? '/profile' : '/login' },
  ];

  if (!isGlobalUIVisible) return null;

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
        const Icon = item.icon;
        
        return (
          <Link
            key={item.id}
            href={item.path}
            className={cn("nav-item", isActive && "active")}
          >
            <div className="nav-icon">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}