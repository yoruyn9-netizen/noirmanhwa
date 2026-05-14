
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
  borderId?: string;
}

export default function AvatarDisplay({ src, name, size = 'md', className, borderId }: AvatarDisplayProps) {
  const sizeMap = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-24 h-24 rounded-[2.5rem]',
    huge: 'w-32 h-32 rounded-[3rem]'
  };

  const iconSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
    huge: 'w-14 h-14'
  };

  const initials = name ? name.substring(0, 2).toUpperCase() : '?';

  return (
    <div className={cn(
      "relative flex items-center justify-center overflow-visible shadow-2xl",
      sizeMap[size],
      className
    )}>
      {/* Border Overlay */}
      <AvatarBorderOverlay borderId={borderId} size={size} />

      <div className={cn(
        "w-full h-full rounded-[inherit] overflow-hidden flex items-center justify-center bg-[#0a0a0f] border border-white/10",
        sizeMap[size]
      )}>
        {src ? (
          <img 
            src={src} 
            alt={name || "Avatar"} 
            className="w-full h-full object-cover transition-opacity duration-500" 
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : name ? (
          <span className="text-[10px] font-black text-accent">{initials}</span>
        ) : (
          <User className={cn("text-neutral-800", iconSizeMap[size])} />
        )}
      </div>
    </div>
  );
}
