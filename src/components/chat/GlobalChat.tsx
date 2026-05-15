
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { subscribeToChat, sendChatMessage } from '@/lib/firestore';
import { ChatMessage } from '@/types/chat';
import MessageBubble from './MessageBubble';
import { 
  Send, 
  MessageSquare, 
  Lock, 
  Maximize2,
  Loader2
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
        senderName: user.displayName || 'Guest',
        senderPhoto: user.photoURL,
        isOwner: user.role === 'owner',
        replyTo: null,
        replyToUser: null,
        mangaMention: null 
      });

      setInputText('');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message.' });
    }
  };

  const displayedMessages = previewMode ? messages.slice(-5) : messages;

  return (
    <section className={previewMode ? "mt-24 px-4 pb-20" : "h-full flex flex-col"}>
      <div className={previewMode ? "max-w-4xl mx-auto space-y-6" : "flex-1 flex flex-col max-w-5xl mx-auto w-full"}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-4">
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
            <button 
              onClick={() => router.push('/chat')}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-[9px] font-black uppercase tracking-widest"
            >
              <Maximize2 className="w-3 h-3" />
              Full View
            </button>
          )}
        </div>

        {/* Container */}
        <div className={previewMode 
          ? "h-[450px] flex flex-col bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative" 
          : "flex-1 flex flex-col bg-[#0a0a0f]/40 backdrop-blur-3xl border-x border-white/5 overflow-hidden"
        }>
          {/* Message Stream */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar"
          >
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <span className="text-[9px] font-black uppercase tracking-widest">Loading Conversation</span>
              </div>
            ) : (
              displayedMessages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isMe={user?.uid === msg.senderId} 
                />
              ))
            )}
          </div>

          {/* Footer Input or Login Prompt */}
          <div className="p-6 bg-white/5 border-t border-white/5">
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
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full bg-[#050508] border border-white/5 rounded-2xl pl-6 pr-16 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 text-[12px] font-medium placeholder:text-neutral-700 min-h-[56px] max-h-32 resize-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-accent text-white rounded-xl shadow-lg disabled:opacity-20 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
