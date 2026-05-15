
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import AvatarDisplay from '../profile/AvatarDisplay';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

export default function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const isOwner = message.isOwner;
  const timestamp = message.timestamp?.toDate ? formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true }) : 'just now';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3",
        isMe ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className="flex-shrink-0">
        <AvatarDisplay 
          src={message.senderPhoto} 
          name={message.senderName} 
          size="sm" 
        />
      </div>

      <div className={cn("max-w-[80%] space-y-1", isMe ? "items-end text-right" : "items-start text-left")}>
        <div className={cn("flex items-center gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
          <span className={cn("text-[9px] font-black uppercase tracking-widest", isOwner ? "text-yellow-500" : "text-neutral-500")}>
            {message.senderName}
          </span>
          {isOwner && (
            <Crown className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
          )}
          <span className="text-[7px] text-neutral-700 font-bold uppercase">{timestamp}</span>
        </div>

        <div className={cn(
          "p-3.5 rounded-2xl border text-[11px] font-medium leading-relaxed shadow-lg",
          isMe 
            ? "bg-accent text-white border-accent/20 rounded-tr-none" 
            : isOwner 
              ? "bg-yellow-500/10 border-yellow-500/20 text-white rounded-tl-none"
              : "bg-white/5 border-white/5 text-neutral-300 rounded-tl-none"
        )}>
          {message.text}
        </div>
      </div>
    </motion.div>
  );
}
