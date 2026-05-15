
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Crown, Sparkles, Reply, ShieldCheck, Zap } from 'lucide-react';
import AvatarDisplay from '../profile/AvatarDisplay';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  onUserClick?: (userId: string) => void;
  onReplyClick?: () => void;
}

export default function MessageBubble({ message, isMe, onUserClick, onReplyClick }: MessageBubbleProps) {
  const isOwner = message.isOwner;
  
  const timestamp = message.timestamp?.toDate 
    ? formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true }) 
    : 'just now';

  const hasReply = !!message.replyTo;

  return (
    <motion.div
      initial={{ opacity: 0, x: isMe ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      className={cn(
        "flex gap-3 mb-2 w-full",
        isMe ? "flex-row-reverse" : "flex-row",
        isOwner && "my-6"
      )}
    >
      <div 
        className="flex-shrink-0 relative group cursor-pointer active:scale-95 transition-transform mt-auto"
        onClick={() => onUserClick?.(message.senderId)}
      >
        <AvatarDisplay 
          src={message.senderPhoto} 
          name={message.senderName} 
          size={isOwner ? "md" : "sm"} 
          borderId={isOwner ? "ink-master" : "none"}
        />
        {isOwner && (
          <div className="absolute -top-1 -left-1 bg-yellow-500 rounded-full p-1 shadow-lg animate-bounce">
             <Crown className="w-2 h-2 text-black fill-current" />
          </div>
        )}
      </div>

      <div className={cn(
        "flex flex-col gap-1.5", 
        isMe ? "items-end" : "items-start",
        "max-w-[85%] sm:max-w-[75%]"
      )}>
        <div className={cn("flex items-center gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
          <div 
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onUserClick?.(message.senderId)}
          >
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

        <div className={cn("relative group", isMe ? "text-right" : "text-left")}>
          
          {!isOwner && (
            <button 
              onClick={onReplyClick}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 p-2 bg-white/5 border border-white/10 rounded-lg text-neutral-600 hover:text-accent hover:border-accent/40 opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-20",
                isMe ? "-left-12" : "-right-12"
              )}
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
          )}

          {isOwner ? (
            <div className="relative cursor-default">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-purple-500/10 blur-md opacity-50" />
              <div className={cn(
                "relative px-5 py-4 text-[12px] font-bold leading-relaxed text-white shadow-2xl overflow-hidden w-fit",
                "bg-gradient-to-br from-[#1a1a1f] to-[#0a0a0f] border border-yellow-500/30",
                "rounded-2xl",
                isMe ? "rounded-tr-none" : "rounded-tl-none"
              )}>
                {hasReply && (
                  <div className="mb-3 p-3 bg-black/40 border-l-2 border-yellow-500 rounded-lg text-left opacity-70">
                    <p className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">{message.replyToUser}</p>
                    <p className="text-[10px] text-neutral-400 line-clamp-1 italic">{message.replyToText}</p>
                  </div>
                )}
                <div className="relative z-10 flex flex-col gap-2">
                  <p className="tracking-wide">{message.text}</p>
                  <div className="flex items-center gap-2 pt-1 mt-1 border-t border-white/5 opacity-40">
                     <div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,1)]" />
                     <span className="text-[6px] font-black uppercase tracking-[0.3em]">Celestial Legend</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={cn(
              "flex flex-col rounded-2xl border text-[11px] font-medium leading-relaxed shadow-lg transition-all duration-300 w-fit overflow-hidden",
              isMe 
                ? "bg-accent text-white border-accent/20 rounded-tr-none" 
                : "bg-white/5 border-white/5 text-neutral-300 rounded-tl-none"
            )}>
              {hasReply && (
                <div className={cn(
                  "px-4 py-2 bg-black/20 border-b border-white/5 opacity-80 text-left",
                  isMe ? "border-l-4 border-white/20" : "border-l-4 border-accent"
                )}>
                  <p className={cn(
                    "text-[8px] font-black uppercase tracking-widest",
                    isMe ? "text-white/60" : "text-accent"
                  )}>{message.replyToUser}</p>
                  <p className="text-[9px] text-neutral-400 line-clamp-1 truncate max-w-[200px] italic">"{message.replyToText}"</p>
                </div>
              )}
              
              <div className="px-4 py-3">
                {message.text}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
