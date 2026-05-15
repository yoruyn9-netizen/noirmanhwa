"use client";

import React from 'react';
import { User } from 'lucide-react';
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
 * Enhanced Avatar Display Node
 * Features deep integration with the PNG Border Engine.
 */
export default function AvatarDisplay({ src, name, size = 'md', className, borderId }: AvatarDisplayProps) {
  const sizeMap = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-24 h-24 rounded-[2.5rem]',
    huge: 'w-32 h-32 rounded-[3rem]'
  };

  const initials = name ? name.substring(0, 2).toUpperCase() : '?';

  return (
    <div className={cn(
      "relative flex items-center justify-center select-none shadow-2xl overflow-visible",
      sizeMap[size],
      className
    )}>
      {/* PNG Border Overlay Protocol */}
      {borderId && <AvatarBorderOverlay borderId={borderId} size={size} />}

      <div className={cn(
        "w-full h-full rounded-[inherit] overflow-hidden flex items-center justify-center bg-[#0a0a0f] border border-white/5",
        "relative z-10" // Content is below the border overlay
      )}>
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
