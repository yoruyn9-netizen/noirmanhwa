
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Crown, BookOpen, Quote, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import AvatarDisplay from '../profile/AvatarDisplay';
import UserProfileModal from './UserProfileModal';

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
        {/* Avatar */}
        <button 
          onClick={() => setShowProfile(true)}
          className="flex-shrink-0 transition-transform active:scale-95"
        >
          <AvatarDisplay 
            src={message.senderPhoto} 
            name={message.senderName} 
            size="md" 
            className={cn(
              "border-2",
              isOwner ? "border-yellow-500/50" : "border-white/5"
            )}
          />
        </button>

        {/* Content */}
        <div className={cn(
          "max-w-[80%] space-y-1.5",
          isMe ? "items-end" : "items-start"
        )}>
          {/* Name Bar */}
          <div className={cn(
            "flex items-center gap-2",
            isMe ? "flex-row-reverse" : "flex-row"
          )}>
            <button 
              onClick={() => setShowProfile(true)}
              className={cn(
                "text-[9px] font-black uppercase tracking-widest hover:underline",
                isOwner ? "text-yellow-500" : "text-neutral-500"
              )}
            >
              {message.senderName}
            </button>
            {isOwner && <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
            <span className="text-[7px] text-neutral-700 font-bold uppercase">{timestamp}</span>
          </div>

          {/* Bubble */}
          <div className={cn(
            "relative p-4 rounded-3xl border transition-all duration-500",
            isMe 
              ? "bg-accent text-white border-accent/20 rounded-tr-none" 
              : "bg-[#0a0a0f]/60 backdrop-blur-md border-white/5 rounded-tl-none",
            isOwner && !isMe && "border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent"
          )}>
            {/* Reply Context */}
            {message.replyTo && (
              <div className="mb-3 p-3 bg-black/20 border-l-2 border-white/20 rounded-xl flex items-start gap-3">
                <Quote className="w-3 h-3 text-white/40" />
                <div className="flex-1">
                  <p className="text-[7px] font-black uppercase text-white/60 mb-1">{message.replyToUser}</p>
                  <p className="text-[9px] text-white/40 italic line-clamp-1">Original Node Data Extraction...</p>
                </div>
              </div>
            )}

            {/* Manga Mention */}
            {message.mangaMention && (
              <Link 
                href={`/series/${message.mangaMention.mangaId}`}
                className="flex items-center gap-3 p-3 mb-3 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-all group/manga"
              >
                <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
                  <BookOpen className="w-3 h-3 text-accent" />
                </div>
                <span className="text-[9px] font-black uppercase text-white group-hover/manga:text-accent transition-colors">
                  📖 {message.mangaMention.title}
                </span>
              </Link>
            )}

            <p className="text-[11px] leading-relaxed font-medium whitespace-pre-wrap">
              {message.text}
            </p>

            {/* Quick Actions */}
            <button 
              onClick={() => onReply(message)}
              className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <UserProfileModal 
        userId={message.senderId} 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
    </>
  );
}
