
"use client";

import React from 'react';
import { getBorderById } from '@/lib/borders';
import { cn } from '@/lib/utils';

interface AvatarBorderOverlayProps {
  borderId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'huge';
  className?: string;
}

export default function AvatarBorderOverlay({ borderId = 'none', size = 'md', className }: AvatarBorderOverlayProps) {
  if (borderId === 'none') return null;

  const border = getBorderById(borderId);
  
  const sizeMap = {
    sm: 'p-[2px] rounded-lg border-2',
    md: 'p-[3px] rounded-xl border-2',
    lg: 'p-1 rounded-2xl border-[3px]',
    xl: 'p-1.5 rounded-[2.8rem] border-4',
    huge: 'p-2 rounded-[3.5rem] border-[6px]'
  };

  return (
    <div className={cn(
      "absolute inset-0 pointer-events-none z-10",
      sizeMap[size],
      border.cssClass,
      className
    )} style={{ color: border.color }}>
      {/* Visual embellishments for high-tier borders */}
      {border.tier === 'legend' && (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-purple-500 rounded-full blur-md animate-pulse" />
      )}
    </div>
  );
}
