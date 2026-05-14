
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
  X,
  AtSign,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface GlobalChatProps {
  previewMode?: boolean;
}

export default function GlobalChat({ previewMode = false }: GlobalChatProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
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
    if (scrollRef.current && !previewMode) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, previewMode]);

  const handleSend = async () => {
    if (!user || !inputText.trim()) return;

    try {
      await sendChatMessage({
        text: inputText,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderPhoto: user.photoURL,
        isOwner: user.role === 'owner',
        replyTo: replyingTo?.id || null,
        replyToUser: replyingTo?.senderName || null,
        mangaMention: null 
      });

      setInputText('');
      setReplyingTo(null);
      setShowMentions(false);
    } catch (err) {
      console.error('[Chat Fail]:', err);
      toast({ variant: 'destructive', title: 'Transmission Failed', description: 'Could not send message.' });
    }
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

  const handleSelectMention = async (manga: Manga) => {
    if (!user) return;
    
    const mentionTitle = manga.attributes.title.en || manga.attributes.title.id || 'Manga';
    
    try {
      await sendChatMessage({
        text: `📖 [${mentionTitle}]`,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderPhoto: user.photoURL,
        isOwner: user.role === 'owner',
        replyTo: replyingTo?.id || null,
        replyToUser: replyingTo?.senderName || null,
        mangaMention: {
          mangaId: manga.id,
          title: mentionTitle
        }
      });

      setInputText('');
      setShowMentions(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Sync Failed', description: 'Could not mention title.' });
    }
  };

  if (!user && !previewMode) {
    return (
      <section className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center space-y-8">
        <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] border border-accent/20 flex items-center justify-center shadow-2xl">
          <Lock className="w-8 h-8 text-accent/40" />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-black uppercase tracking-tight text-white">Chat Restricted</h3>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest max-w-[240px] mx-auto opacity-60">
            Please sign in to participate in the global chat community.
          </p>
        </div>
        <Link 
          href="/login" 
          className="px-12 py-5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all shadow-2xl"
        >
          Sign In Now
        </Link>
      </section>
    );
  }

  const displayedMessages = previewMode ? messages.slice(-5) : messages;

  return (
    <section className={previewMode ? "mt-20 px-4" : "h-full flex flex-col"}>
      <div className={previewMode ? "max-w-4xl mx-auto space-y-8" : "flex-1 flex flex-col max-w-5xl mx-auto w-full"}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-accent" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Global Chat</h2>
          </div>
          
          {previewMode ? (
            <button 
              onClick={() => router.push('/chat')}
              className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-accent/10 hover:border-accent/20 transition-all text-accent group"
            >
              <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black uppercase tracking-widest">Open Chat</span>
            </button>
          ) : (
             <div className="flex items-center gap-3 text-neutral-600 font-bold text-[8px] uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              Online
            </div>
          )}
        </div>

        {/* Container */}
        <div className={previewMode 
          ? "h-[400px] flex flex-col bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative group" 
          : "flex-1 flex flex-col bg-[#0a0a0f]/40 backdrop-blur-3xl border-x border-white/5 overflow-hidden"
        }>
          {/* Message Stream */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-2 hide-scrollbar"
          >
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-widest">Loading Messages</span>
              </div>
            ) : (
              displayedMessages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isMe={user?.uid === msg.senderId} 
                  onReply={previewMode ? undefined : setReplyingTo}
                />
              ))
            )}
          </div>

          {/* Preview Overlay */}
          {previewMode && (
             <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-[#020205] to-transparent flex justify-center">
               <Link href="/chat" className="px-10 py-4 bg-accent text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 transition-all">
                 Join the Conversation
               </Link>
             </div>
          )}

          {/* Full Input Area */}
          {!previewMode && user && (
            <div className="p-6 bg-white/5 border-t border-white/5 relative pb-safe-area-inset-bottom">
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
                  placeholder={showMentions ? "Searching titles..." : "Type a message... (use / to mention a title)"}
                  className="w-full bg-[#050508] border border-white/5 rounded-[2rem] pl-6 pr-20 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 text-[12px] font-medium placeholder:text-neutral-700 min-h-[64px] max-h-32 resize-none transition-all shadow-inner"
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
                   ENTER TO SEND • SHIFT+ENTER FOR NEW LINE
                 </span>
                 <div className="flex items-center gap-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse" />
                   <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest">CONNECTED</span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
