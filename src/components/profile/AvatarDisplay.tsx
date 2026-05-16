
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import AvatarBorderOverlay from './AvatarBorderOverlay';

interface AvatarDisplayProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'huge';
  className?: string;
  borderId?: string | null;
}

/**
 * Node Tampilan Avatar yang Ditingkatkan
 * Mendukung sistem layering otomatis untuk Border (z-20) dan Avatar (z-10).
 */
export default function AvatarDisplay({ src, name, size = 'md', className, borderId }: AvatarDisplayProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
    huge: 'w-32 h-32'
  };

  const initials = name ? name.substring(0, 2).toUpperCase() : '?';

  return (
    <div className={cn(
      "relative flex items-center justify-center select-none shadow-2xl overflow-visible",
      sizeMap[size],
      className
    )}>
      {/* PNG Border - Lapisan Tengah (z-20) */}
      {borderId && <AvatarBorderOverlay borderId={borderId} size={size} />}

      {/* Kontainer Avatar - Lapisan Belakang (z-10) */}
      <div 
        className={cn(
          "w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#0a0a0f] border border-white/5 relative"
        )}
        style={{ zIndex: 10 }}
      >
        {src ? (
          <img 
            src={src} 
            alt={name || "Avatar"} 
            className="w-full h-full object-cover transition-opacity duration-500" 
          />
        ) : (
          <div className="bg-accent/10 w-full h-full flex items-center justify-center">
            <span className="text-[10px] font-black text-accent">{initials}</span>
          </div>
        )}
      </div>
    </div>
  );
}
