
"use client";

import React from 'react';
import { getFlag } from '@/lib/utils/flagMapper';
import { MangaSource } from '@/types/manga';
import { cn } from '@/lib/utils';

interface FlagBadgeProps {
  source: MangaSource;
  language?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FlagBadge({ source, language, className, size = 'md' }: FlagBadgeProps) {
  const flag = getFlag(source, language);
  
  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-7 h-7 text-[12px]',
    lg: 'w-10 h-10 text-[18px]'
  };

  return (
    <div className={cn(
      "flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg select-none",
      sizeClasses[size],
      className
    )}>
      {flag}
    </div>
  );
}
