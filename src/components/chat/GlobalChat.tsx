"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { subscribeToChat, sendChatMessage } from '@/lib/firestore';
import { ChatMessage, MangaMention } from '@/types/chat';
import MessageBubble from './MessageBubble';
import UserProfileModal from '@/components/UserProfileModal';
import { 
  Send, 
  MessageSquare, 
  Maximize2,
  Loader2,
  X,
  Reply,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ThreeBodyLoader from '../ui/ThreeBodyLoader';
import { Manga } from '@/types/manga';
import Image from 'next/image';
import { useDebounce } from 'use-debounce';

// --- Helper Components ---

const MangaMentionDropdown = ({
  results,
  isLoading,
  onSelect,
  highlightedIndex,
  onClose
}: {
  results: Manga[],
  isLoading: boolean,
  onSelect: (manga: Manga) => void,
  highlightedIndex: number,
  onClose: () => void,
}) => (
  <AnimatePresence>
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute bottom-full left-0 right-0 mb-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden shadow-2xl z-20"
    >
      <div className="max-h-64 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-neutral-400">Loading...</div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-sm text-neutral-400">No manga found.</div>
        ) : (
          results.map((manga, index) => (
            <div
              key={manga.id}
              onClick={() => onSelect(manga)}
              className={cn(
                "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                highlightedIndex === index ? "bg-accent/20" : "hover:bg-white/5"
              )}
            >
              <Image src={manga.coverImage} alt={manga.title} width={40} height={60} className="rounded-md object-cover" />
              <div className="flex-1">
                <p className="font-bold text-white text-sm line-clamp-1">{manga.title}</p>
                <p className="text-xs text-neutral-400 capitalize">{manga.status || 'N/A'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  </AnimatePresence>
);

// --- Main Component ---

interface GlobalChatProps {
  previewMode?: boolean;
}

export default function GlobalChat({ previewMode = false }: GlobalChatProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  
  // Manga Mention State
  const [mentions, setMentions] = useState<MangaMention[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [debouncedMentionQuery] = useDebounce(mentionQuery, 300);
  const [mentionResults, setMentionResults] = useState<Manga[]>([]);
  const [isMentionLoading, setIsMentionLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToChat((msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);

    const mentionTriggerIndex = text.lastIndexOf('@');
    if (mentionTriggerIndex !== -1) {
      const query = text.substring(mentionTriggerIndex + 1);
      setMentionQuery(query);
      setIsDropdownOpen(true);
      setHighlightedIndex(0);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleSelectManga = (manga: Manga) => {
    const mention: MangaMention = {
      type: "manga_mention",
      mangaId: manga.id,
      title: manga.title,
      coverUrl: manga.coverImage
    };
    
    setMentions(prev => [...prev, mention]);
    
    const mentionTriggerIndex = inputText.lastIndexOf('@');
    const newText = `${inputText.substring(0, mentionTriggerIndex)}📖 ${manga.title} `;
    
    setInputText(newText);
    setIsDropdownOpen(false);
    setMentionQuery('');
    setMentionResults([]);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!user || !inputText.trim()) return;

    try {
      await sendChatMessage({
        text: inputText,
        senderId: user.uid,
        senderName: user.displayName || 'Guest',
        senderPhoto: user.photoURL,
        isOwner: user.role === 'owner',
        replyTo: replyTarget?.id || null,
        replyToUser: replyTarget?.senderName || null,
        replyToText: replyTarget?.text || null,
        mentions: mentions,
      });

      setInputText('');
      setReplyTarget(null);
      setMentions([]);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message.' });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isDropdownOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % mentionResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + mentionResults.length) % mentionResults.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (!e.shiftKey && mentionResults.length > 0) {
          e.preventDefault();
          handleSelectManga(mentionResults[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsDropdownOpen(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (debouncedMentionQuery) {
      setIsMentionLoading(true);
      fetch(`/api/manga?q=${debouncedMentionQuery}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.mangas) {
                setMentionResults(data.mangas);
            } else {
                setMentionResults([]);
            }
        })
        .catch(() => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to search manga.' });
          setMentionResults([]);
        })
        .finally(() => setIsMentionLoading(false));
    } else {
      setMentionResults([]);
    }
  }, [debouncedMentionQuery, toast]);

  const handleReplyAction = (msg: ChatMessage) => {
    if (!user) return;
    setReplyTarget(msg);
  };

  const displayedMessages = previewMode ? messages.slice(-5) : messages;

  return (
    <section className={cn("relative flex flex-col min-h-0", previewMode ? "mt-24 px-4 pb-20" : "h-full flex-1")}>
      <div className={cn("flex flex-col w-full mx-auto min-h-0", previewMode ? "max-w-4xl space-y-6" : "flex-1 max-w-5xl h-full")}>
        <div className="flex items-center justify-between px-2 py-4 shrink-0">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-accent/5 rounded-xl border border-accent/10">
                <MessageSquare className="w-5 h-5 text-accent" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-black uppercase tracking-tighter text-white leading-none">Community Chat</h2>
                <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Connect with other readers</p>
              </div>
            </div>
            {previewMode && (
              <button onClick={() => router.push('/chat')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-[9px] font-black uppercase tracking-widest">
                <Maximize2 className="w-3 h-3" />
                Full View
              </button>
            )}
        </div>

        <div className={cn("flex flex-col bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 overflow-hidden shadow-2xl relative min-h-0", previewMode ? "h-[450px] rounded-[2.5rem]" : "flex-1 rounded-[2.5rem] mb-6")}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar overscroll-contain">
            {/* Messages */}
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                <ThreeBodyLoader />
                <span className="text-[9px] font-black uppercase tracking-widest text-accent animate-pulse">Syncing Logs</span>
              </div>
            ) : displayedMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                   <p className="text-[10px] font-black uppercase tracking-widest">Signal Void: Start a conversation</p>
                </div>
            ) : (
              displayedMessages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isMe={user?.uid === msg.senderId}
                  onUserClick={setSelectedUserId}
                  onReplyClick={() => handleReplyAction(msg)}
                />
              ))
            )}
          </div>

          <AnimatePresence>
            {replyTarget && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white/5 border-t border-white/10 overflow-hidden shrink-0">
                <div className="px-6 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 border-l-2 border-accent pl-3 overflow-hidden">
                    <Reply className="w-3 h-3 text-accent shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-accent uppercase tracking-widest">Replying to {replyTarget.senderName}</p>
                      <p className="text-[10px] text-neutral-400 truncate italic">{replyTarget.text}</p>
                    </div>
                  </div>
                  <button onClick={() => setReplyTarget(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X className="w-3 h-3 text-neutral-500" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-6 bg-white/5 border-t border-white/5 relative z-10 shrink-0">
             {isDropdownOpen && (
                <MangaMentionDropdown
                  results={mentionResults}
                  isLoading={isMentionLoading}
                  onSelect={handleSelectManga}
                  highlightedIndex={highlightedIndex}
                  onClose={() => setIsDropdownOpen(false)}
                />
              )}
            {!user ? (
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Sign in to participate in the chat</p>
                <Link href="/login" className="px-6 py-2.5 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-xl">
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Broadcast your message... use '@' to mention manga"
                  className="w-full bg-[#050508] border border-white/5 rounded-2xl pl-6 pr-16 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 text-[12px] font-medium placeholder:text-neutral-800 min-h-[56px] max-h-32 resize-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-accent text-white rounded-xl shadow-lg disabled:opacity-20 transition-all active:scale-90"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <UserProfileModal userId={selectedUserId} isOpen={!!selectedUserId} onClose={() => setSelectedUserId(null)} />
    </section>
  );
}
