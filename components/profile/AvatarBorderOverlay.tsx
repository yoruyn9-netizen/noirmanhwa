
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
 * Uses scale transformation to perfectly wrap the circular avatar nodes.
 */
export default function AvatarBorderOverlay({ borderUrl, size = 'md', className }: AvatarBorderOverlayProps) {
  if (!borderUrl) return null;

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
          "scale-[1.25]" // Scaling up to cover the circular avatar edges perfectly
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
