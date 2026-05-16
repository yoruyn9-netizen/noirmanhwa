
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarBorderOverlayProps {
  borderId: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'huge';
  className?: string;
}

// Direct PNG High-Fidelity Links
const borderMap: Record<string, string> = {
  'ink-master': 'https://i.ibb.co.com/DgDsKgVh/9b6b3710-d9a6-42ce-9237-0a4655ecd205-20260516-032637-0000.png',
  'cyber-core': 'https://i.ibb.co.com/JR5FhyDW/f0d15853-c7ab-4a2a-a14e-8e0d2ba6c330-20260516-032602-0000.png',
  'celestial-dream': 'https://i.ibb.co.com/n85NZRVB/c3d098ec-c12d-4ece-b742-adc657357290-20260516-032528-0000.png',
  'stellar-compass': 'https://i.ibb.co.com/LdzzJtRW/823e8e96-4d93-49dc-be69-36c49b67a1b8-20260516-032451-0000.png'
};

export default function AvatarBorderOverlay({ borderId, size = 'md', className }: AvatarBorderOverlayProps) {
  if (!borderId || borderId === 'none') return null;

  const src = borderMap[borderId] || borderId;

  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible",
        className
      )}
      style={{ zIndex: 20 }}
    >
      <img 
        src={src} 
        alt="Avatar Border" 
        className={cn(
          "object-contain max-w-none transition-transform duration-700",
          "scale-[1.28]" // Perfectly wraps the circular avatar clip
        )}
        style={{
          width: '100%',
          height: '100%'
        }}
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
