"use client";

import React from 'react';
import { User, BookOpen, Sword, Heart, Crown, Infinity } from 'lucide-react';
import { cn } from '@/lib/utils';

const BADGE_CONFIG: { [key: string]: { icon: React.ElementType, color: string, name: string, glow?: string } } = {
  newcomer: { icon: User, color: 'text-gray-400', name: 'Newcomer' },
  active_reader: { icon: BookOpen, color: 'text-blue-400', name: 'Active Reader' },
  seven_day_warrior: { icon: Sword, color: 'text-purple-400', name: '7-Day Warrior', glow: 'hover:shadow-purple-500/50' },
  dedicated_fan: { icon: Heart, color: 'text-orange-400', name: 'Dedicated Fan' },
  legend: { icon: Crown, color: 'text-yellow-400', name: 'Legend', glow: 'hover:shadow-yellow-500/50' },
  immortal: { icon: Infinity, color: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500', name: 'Immortal', glow: 'hover:shadow-violet-500/50' },
};

interface BadgeDisplayProps {
  badgeId: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BadgeDisplay({ badgeId, size = 'sm' }: BadgeDisplayProps) {
  const badge = BADGE_CONFIG[badgeId];
  if (!badge) return null;

  const Icon = badge.icon;
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5 group tooltip', badge.glow)}>
        <Icon className={cn(sizeClasses[size], badge.color, 'transition-all')} />
        <span className="tooltip-text bg-gray-800 text-white text-xs px-2 py-1 rounded-md">
            {badge.name}
        </span>
    </div>
  );
}
