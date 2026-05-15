"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Crown, Sparkles } from 'lucide-react';
import AvatarDisplay from '../profile/AvatarDisplay';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

/**
 * Message Bubble with Specialized Owner Protocol
 * Features high-fidelity animations and unique geometry for the owner role.
 */
export default function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const isOwner = message.isOwner;
  const timestamp = message.timestamp?.toDate 
    ? formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true }) 
    : 'just now';

  return (
    <motion.div
      initial={{ opacity: 0, x: isMe ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      className={cn(
        "flex gap-3 mb-2",
        isMe ? "flex-row-reverse" : "flex-row",
        isOwner && "my-6" // Extra vertical spacing for high-tier messages
      )}
    >
      <div className="flex-shrink-0 relative group">
        <AvatarDisplay 
          src={message.senderPhoto} 
          name={message.senderName} 
          size={isOwner ? "md" : "sm"} 
          borderId={isOwner ? "legend-owner" : "none"}
        />
        {isOwner && (
          <div className="absolute -top-1 -left-1 bg-yellow-500 rounded-full p-1 shadow-lg shadow-yellow-500/40 animate-bounce">
             <Crown className="w-2 h-2 text-black fill-current" />
          </div>
        )}
      </div>

      <div className={cn(
        "max-w-[85%] space-y-1.5", 
        isMe ? "items-end text-right" : "items-start text-left"
      )}>
        {/* Nameplate & Status */}
        <div className={cn("flex items-center gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest", 
              isOwner ? "text-yellow-500 text-glow" : "text-neutral-500"
            )}>
              {message.senderName}
            </span>
            {isOwner && <Sparkles className="w-2.5 h-2.5 text-yellow-500 animate-pulse" />}
          </div>
          <span className="text-[6px] text-neutral-800 font-bold uppercase tracking-widest">{timestamp}</span>
        </div>

        {/* Message Container */}
        {isOwner ? (
          /* Specialized Owner Bubble Shape & Effect */
          <div className="relative group/owner cursor-default">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-purple-500/10 to-transparent blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className={cn(
              "relative px-5 py-4 text-[12px] font-bold leading-relaxed text-white shadow-2xl overflow-hidden",
              "bg-gradient-to-br from-[#1a1a1f] to-[#0a0a0f] border border-yellow-500/30",
              "rounded-2xl rounded-tl-none animate-shimmer-sweep",
              "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.05),transparent_70%)]"
            )}>
              {/* Animated Light Sweep Line */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[45deg] animate-[shimmer-sweep_4s_infinite]" />
              </div>

              <div className="relative z-10 flex flex-col gap-2">
                <p className="tracking-wide">{message.text}</p>
                
                {/* Protocol Badge at bottom of Owner Bubble */}
                <div className="flex items-center gap-2 pt-1 mt-1 border-t border-white/5 opacity-40">
                   <div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse" />
                   <span className="text-[6px] font-black uppercase tracking-[0.3em]">Supreme Protocol Active</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Message Bubble */
          <div className={cn(
            "p-3.5 rounded-2xl border text-[11px] font-medium leading-relaxed shadow-lg transition-all duration-300",
            isMe 
              ? "bg-accent text-white border-accent/20 rounded-tr-none hover:brightness-110" 
              : "bg-white/5 border-white/5 text-neutral-300 rounded-tl-none hover:bg-white/10"
          )}>
            {message.text}
          </div>
        )}
      </div>
    </motion.div>
  );
}