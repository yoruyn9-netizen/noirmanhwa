"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarBorderOverlayProps {
  borderId: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'huge';
  className?: string;
}

// System Static Border Map
const borderMap: Record<string, string> = {
  'ink-master': 'https://files.catbox.moe/11w4o6.jpg',
  'cyber-core': 'https://files.catbox.moe/547ajf.jpg',
  'celestial-dream': 'https://files.catbox.moe/i37jwr.jpg',
  'stellar-compass': 'https://files.catbox.moe/celsgv.jpg'
};

/**
 * PNG Border Overlay Engine
 * Uses scale transformation to perfectly wrap the circular avatar nodes.
 */
export default function AvatarBorderOverlay({ borderId, size = 'md', className }: AvatarBorderOverlayProps) {
  if (!borderId || borderId === 'none') return null;

  // Note: For dynamic borders uploaded by owner, the borderId will be the Firestore doc ID.
  // We handle static defaults here, and fetch dynamic ones via effect in parent if needed.
  // For this MVP, we assume borderId is either static key or a direct URL if custom.
  const src = borderMap[borderId] || borderId;

  return (
    <div className={cn(
      "absolute inset-0 pointer-events-none z-20 flex items-center justify-center",
      className
    )}>
      <img 
        src={src} 
        alt="Avatar Border" 
        className={cn(
          "object-contain max-w-none transition-transform duration-700",
          "scale-[1.25]" 
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
