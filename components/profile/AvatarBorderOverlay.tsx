
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
  if (borderId === 'none' || !borderId) return null;

  const border = getBorderById(borderId);
  
  const sizeMap = {
    sm: 'p-[2px] rounded-lg border-2',
    md: 'p-[3px] rounded-xl border-2',
    lg: 'p-1 rounded-2xl border-[3px]',
    xl: 'p-1.5 rounded-[2.8rem] border-4',
    huge: 'p-2 rounded-[3.5rem] border-[6px]'
  };

  // If it's a custom uploaded border, we render the image instead of CSS styles
  if (borderId.startsWith('custom-')) {
    return (
      <div className={cn(
        "absolute inset-0 pointer-events-none z-10",
        className
      )}>
        <img 
          src={border.imageUrl} 
          alt="Border" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "absolute inset-0 pointer-events-none z-10",
      sizeMap[size],
      border.cssClass,
      className
    )} style={{ color: border.color }}>
      {/* High-Tier Visual Effects */}
      {border.tier === 'legend' && (
        <div className="absolute inset-0 rounded-[inherit] border-animate-glow opacity-40 bg-current blur-md -z-10" />
      )}
    </div>
  );
}
