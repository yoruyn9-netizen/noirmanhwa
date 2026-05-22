"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage, MangaMention } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Crown, Sparkles, Reply } from 'lucide-react';
import AvatarDisplay from '../profile/AvatarDisplay';
import Link from 'next/link';
import Image from 'next/image';

// --- Helper Components ---

const MangaMentionCard = ({ mention }: { mention: MangaMention }) => (
  <Link href={`/manga/${mention.mangaId}`} passHref>
    <a className="inline-flex items-center gap-2 p-2 rounded-xl border border-white/10 bg-white/5 hover:scale-105 hover:shadow-glow transition-all transform duration-150 cursor-pointer my-1">
      <Image src={mention.coverUrl} alt={mention.title} width={30} height={45} className="rounded-md object-cover" />
      <div className="flex-1">
        <p className="font-bold text-white text-xs line-clamp-2">{mention.title}</p>
      </div>
    </a>
  </Link>
);

const renderMessageContent = (message: ChatMessage) => {
  if (!message.mentions || message.mentions.length === 0) {
    return message.text;
  }

  // Create a map for quick lookup
  const mentionMap = new Map<string, MangaMention>();
  message.mentions.forEach(mention => {
    // Use a placeholder for rendering
    mentionMap.set(`📖 ${mention.title}`, mention);
  });

  const regex = new RegExp(`(${Array.from(mentionMap.keys()).join('|')})`, 'g');
  const parts = message.text.split(regex);

  return parts.map((part, index) => {
    const mention = mentionMap.get(part);
    if (mention) {
      return <MangaMentionCard key={`${mention.mangaId}-${index}`} mention={mention} />;
    }
    return <span key={index}>{part}</span>;
  });
};


// --- Main Component ---

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
      )}
    >
      <div 
        className="flex-shrink-0 relative group cursor-pointer active:scale-95 transition-transform mt-auto"
        onClick={() => onUserClick?.(message.senderId)}
      >
        <AvatarDisplay 
          src={message.senderPhoto} 
          name={message.senderName} 
          size="sm"
        />
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
              isOwner ? "text-yellow-400" : "text-neutral-500"
            )}>
              {message.senderName}
            </span>
            {isOwner && <Crown className="w-2.5 h-2.5 text-yellow-400" />}
          </div>
          <span className="text-[7px] text-neutral-700 font-bold uppercase tracking-widest">{timestamp}</span>
        </div>

        <div className={cn("relative group", isMe ? "text-right" : "text-left")}>
          <button 
            onClick={onReplyClick}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 p-2 bg-white/5 border border-white/10 rounded-lg text-neutral-600 hover:text-accent hover:border-accent/40 opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-20",
              isMe ? "-left-12" : "-right-12"
            )}
          >
            <Reply className="w-3.5 h-3.5" />
          </button>

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
                  <p className="text-[9px] text-neutral-400 line-clamp-1 truncate max-w-[200px] italic">\"{message.replyToText}\"</p>
                </div>
              )}
              
              <div className="px-4 py-3 whitespace-pre-wrap">
                {renderMessageContent(message)}
              </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
}
