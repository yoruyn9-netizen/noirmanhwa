"use client";
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  src: string | null | undefined;
  name: string | null | undefined;
  size?: 'small' | 'medium' | 'large' | 'huge';
  className?: string;
  borderUrl?: string | null; // Changed from borderId to borderUrl
}

const sizeMap = {
  small: 'w-10 h-10',
  medium: 'w-16 h-16',
  large: 'w-24 h-24',
  huge: 'w-32 h-32',
};

export default function AvatarDisplay({ 
  src, 
  name, 
  size = 'medium', 
  className, 
  borderUrl 
}: AvatarDisplayProps) {
  const initials = name?.charAt(0).toUpperCase() || '?';
  const avatarSize = sizeMap[size] || sizeMap.medium;

  return (
    <div className={cn('relative aspect-square', avatarSize, className)}>
      <div className="relative z-10 w-full h-full rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
        {src ? (
          <Image 
            src={src} 
            alt={name || 'User Avatar'} 
            layout="fill" 
            objectFit="cover" 
            className="w-full h-full"
          />
        ) : (
          <span className="font-bold text-2xl text-white">{initials}</span>
        )}
      </div>
      {borderUrl && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <Image 
            src={borderUrl} 
            alt="Avatar Border" 
            layout="fill" 
            objectFit="contain" 
          />
        </div>
      )}
    </div>
  );
}
