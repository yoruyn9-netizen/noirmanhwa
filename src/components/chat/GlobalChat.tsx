
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { subscribeToChat, sendChatMessage } from '@/lib/firestore';
import { ChatMessage } from '@/types/chat';
import MessageBubble from './MessageBubble';
import MentionDropdown from './MentionDropdown';
import { mangaApi } from '@/lib/api';
import { Manga } from '@/lib/types';
import { 
  Send, 
  MessageSquare, 
  Lock, 
  ArrowRight,
  X,
  AtSign,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export default function GlobalChat() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState<Manga[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToChat((msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!user || !inputText.trim()) return;

    const mentionManga = mentionResults[0]; // Simple logic for first result if selected

    await sendChatMessage({
      text: inputText,
      senderId: user.uid,
      senderName: user.displayName || 'Anonymous',
      senderPhoto: user.photoURL,
      isOwner: user.role === 'owner',
      replyTo: replyingTo?.id,
      replyToUser: replyingTo?.senderName,
      mangaMention: null // Handle specifically if needed
    });

    setInputText('');
    setReplyingTo(null);
    setShowMentions(false);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (text.includes('/')) {
      const parts = text.split('/');
      const queryStr = parts[parts.length - 1];
      if (queryStr.length > 1) {
        setShowMentions(true);
        const res = await mangaApi.search({ title: queryStr, limit: 5 });
        setMentionResults(res.data || []);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectMention = (manga: Manga) => {
    const parts = inputText.split('/');
    parts.pop();
    const newText = parts.join('/') + `📖 [${manga.attributes.title.en || 'Manga'}] `;
    
    // In real implementation, we'd store the ID separately
    sendChatMessage({
      text: newText,
      senderId: user!.uid,
      senderName: user!.displayName || 'Anonymous',
      senderPhoto: user!.photoURL,
      isOwner: user!.role === 'owner',
      replyTo: replyingTo?.id,
      replyToUser: replyingTo?.senderName,
      mangaMention: {
        mangaId: manga.id,
        title: manga.attributes.title.en || 'Manga'
      }
    });

    setInputText('');
    setShowMentions(false);
  };

  if (!user) {
    return (
      <section className="mt-20 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Global Frequency</h2>
          </div>
          <div className="h-[400px] rounded-[3rem] bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 flex flex-col items-center justify-center p-10 text-center space-y-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-accent/5 via-transparent to-transparent opacity-40" />
            <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] border border-accent/20 flex items-center justify-center shadow-2xl shadow-accent/10">
              <Lock className="w-8 h-8 text-accent/40" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-tight">Signal Gated</h3>
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest max-w-[200px] mx-auto opacity-60">
                Authorized neural link required to access global frequencies.
              </p>
            </div>
            <Link 
              href="/login" 
              className="px-10 py-5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all shadow-2xl group-hover:scale-105"
            >
              Establish Link <ArrowRight className="inline w-3 h-3 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-accent" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Global Frequency</h2>
          </div>
          <div className="flex items-center gap-3 text-neutral-600 font-bold text-[8px] uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            Active Uplink
          </div>
        </div>

        <div className="h-[500px] flex flex-col bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          {/* Chat List */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-2 hide-scrollbar"
          >
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-widest">Syncing Stream</span>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isMe={msg.senderId === user.uid} 
                  onReply={setReplyingTo}
                />
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/5 border-t border-white/5 relative">
            <MentionDropdown 
              results={mentionResults} 
              visible={showMentions} 
              onSelect={handleSelectMention} 
            />

            <AnimatePresence>
              {replyingTo && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 p-4 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <AtSign className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-[8px] font-black uppercase text-accent">Replying to {replyingTo.senderName}</p>
                      <p className="text-[10px] text-white/40 line-clamp-1">{replyingTo.text}</p>
                    </div>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <textarea
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={showMentions ? "Searching signals..." : "Transmit message... use / to mention"}
                className="w-full bg-[#050508] border border-white/5 rounded-[2rem] pl-6 pr-20 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 text-[12px] font-medium placeholder:text-neutral-700 min-h-[64px] max-h-32 resize-none transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-accent text-white rounded-2xl shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-4 flex items-center justify-between px-4">
               <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest">
                 Press Enter to Transmit • Shift+Enter for new line
               </span>
               <div className="flex items-center gap-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                 <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest">Sync: Stabilized</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
