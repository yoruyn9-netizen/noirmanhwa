
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarBorderOverlayProps {
  borderUrl: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'huge';
  className?: string;
}

/**
 * PNG Border Overlay Engine
 * Uses scale transformation to perfectly wrap the circular avatar.
 */
export default function AvatarBorderOverlay({ borderUrl, size = 'md', className }: AvatarBorderOverlayProps) {
  if (!borderUrl) return null;

  // Map sizes to absolute pixel ranges to ensure perfect alignment
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-28 h-24', // Adjusted for profile page
    huge: 'w-36 h-36'
  };

  return (
    <div className={cn(
      "absolute inset-0 pointer-events-none z-20 flex items-center justify-center",
      className
    )}>
      <img 
        src={borderUrl} 
        alt="Avatar Border" 
        className={cn(
          "object-contain max-w-none transition-transform duration-700",
          "scale-[1.25]" // Scaling up to cover the circular avatar edges
        )}
        style={{
          width: '100%',
          height: '100%'
        }}
        draggable={false}
      />
    </div>
  );
}
