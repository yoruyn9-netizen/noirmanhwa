"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Crown, BookOpen } from 'lucide-react';
import Link from 'next/link';
import AvatarDisplay from '../profile/AvatarDisplay';
import ProfileViewModal from '../profile/ProfileViewModal';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  onReply: (msg: ChatMessage) => void;
}

export default function MessageBubble({ message, isMe, onReply }: MessageBubbleProps) {
  const [showProfile, setShowProfile] = useState(false);
  const isOwner = message.isOwner;
  const timestamp = message.timestamp?.toDate ? formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true }) : 'just now';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: isMe ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        onContextMenu={(e) => {
          e.preventDefault();
          onReply(message);
        }}
        className={cn(
          "flex gap-3 mb-6 group",
          isMe ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar with Border Support */}
        <button onClick={() => setShowProfile(true)} className="flex-shrink-0 relative">
          <AvatarDisplay 
            src={message.senderPhoto} 
            name={message.senderName} 
            size="md" 
            borderId={(message as any).senderBorder || 'none'}
          />
        </button>

        {/* Content */}
        <div className={cn("max-w-[80%] space-y-1.5", isMe ? "items-end" : "items-start")}>
          <div className={cn("flex items-center gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
            <button onClick={() => setShowProfile(true)} className={cn("text-[9px] font-black uppercase tracking-widest hover:underline", isOwner ? "text-yellow-500" : "text-neutral-500")}>
              {message.senderName}
            </button>
            {isOwner && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                <Crown className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500 owner-glow" />
                <span className="text-[7px] font-black text-yellow-500 uppercase tracking-widest">Owner</span>
              </div>
            )}
            <span className="text-[7px] text-neutral-700 font-bold uppercase">{timestamp}</span>
          </div>

          <div className={cn(
            "relative p-4 rounded-3xl border transition-all duration-500 shadow-xl",
            isMe 
              ? "bg-accent text-white border-accent/20 rounded-tr-none" 
              : isOwner 
                ? "bg-gradient-to-br from-yellow-500/10 to-accent/10 border-yellow-500/30 rounded-tl-none animate-shimmer-sweep"
                : "bg-[#0a0a0f]/60 backdrop-blur-md border-white/5 rounded-tl-none"
          )}>
            {message.mangaMention && (
              <Link href={`/series/${message.mangaMention.mangaId}`} className="flex items-center gap-3 p-3 mb-3 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-all group/manga">
                <BookOpen className="w-3 h-3 text-accent" />
                <span className="text-[9px] font-black uppercase text-white group-hover/manga:text-accent truncate">📖 {message.mangaMention.title}</span>
              </Link>
            )}

            <p className={cn(
              "text-[11px] leading-relaxed font-medium whitespace-pre-wrap",
              isOwner && "text-white"
            )}>
              {message.text}
            </p>
          </div>
        </div>
      </motion.div>

      <ProfileViewModal userId={message.senderId} isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}