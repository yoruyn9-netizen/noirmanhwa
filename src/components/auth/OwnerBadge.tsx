
"use client";

import React from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface OwnerBadgeProps {
  className?: string;
}

export default function OwnerBadge({ className }: OwnerBadgeProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "relative group cursor-help select-none",
            "animate-in fade-in zoom-in duration-500",
            className
          )}>
            {/* Pulsing Particles */}
            <div className="absolute -inset-2 pointer-events-none">
              <span className="absolute top-0 left-1/4 animate-bounce text-[8px] opacity-40">✨</span>
              <span className="absolute bottom-0 right-1/4 animate-pulse text-[10px] opacity-60 [animation-delay:1s]">✨</span>
            </div>

            {/* Main Badge */}
            <div className={cn(
              "px-4 py-1.5 rounded-xl border border-white/30",
              "bg-gradient-to-r from-cyan-400 via-purple-600 to-pink-500",
              "text-[10px] font-black uppercase tracking-[0.2em] text-white",
              "shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.7)]",
              "transition-all duration-700 hover:scale-110 active:scale-95",
              "animate-[bounce_3s_infinite]"
            )}>
              OWNER
            </div>

            {/* Inner Glow Shine */}
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-black/90 border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-glow">Supreme Administrator</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
