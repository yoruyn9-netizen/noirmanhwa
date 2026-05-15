"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarBorderOverlayProps {
  borderId: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'huge';
  className?: string;
}

// System Static Border Map - High Fidelity Nodes
const borderMap: Record<string, string> = {
  'ink-master': 'https://ibb.co.com/DgDsKgVh',
  'cyber-core': 'https://ibb.co.com/JR5FhyDW',
  'celestial-dream': 'https://ibb.co.com/n85NZRVB',
  'stellar-compass': 'https://ibb.co.com/LdzzJtRW'
};

/**
 * PNG Border Overlay Engine
 * Uses scale transformation to perfectly wrap the circular avatar nodes.
 */
export default function AvatarBorderOverlay({ borderId, size = 'md', className }: AvatarBorderOverlayProps) {
  if (!borderId || borderId === 'none') return null;

  // Resolve source: check static map or assume dynamic URL/ID
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
          "scale-[1.28]" // Optimized scale for perfect circle wrapping
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
