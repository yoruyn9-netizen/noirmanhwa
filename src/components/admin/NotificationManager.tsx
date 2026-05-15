
"use client";

import React, { useState } from 'react';
import { sendNotification } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Bell, Send, Loader2, Sparkles } from 'lucide-react';

export default function NotificationManager() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleBroadcast = async () => {
    if (!title || !message) return;
    setIsSending(true);
    try {
      await sendNotification(title, message);
      toast({ title: "Broadcast Successful", description: "System transmission sent to all nodes." });
      setTitle('');
      setMessage('');
    } catch (err) {
      toast({ variant: "destructive", title: "Transmission Failed", description: "Failed to broadcast signal." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 bg-[#0a0a0f]/60 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
      <div className="space-y-1">
        <h3 className="text-sm font-black uppercase tracking-tighter text-glow flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-accent" /> Signal Broadcast
        </h3>
        <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Transmit announcements to the global grid</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-widest text-accent ml-2">Transmission Title</label>
          <input 
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[11px] uppercase tracking-widest"
            placeholder="SYSTEM UPDATE / MAINTENANCE..."
          />
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-widest text-accent ml-2">Broadcast Content</label>
          <textarea 
            value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-medium text-[11px] resize-none"
            placeholder="ENTER SIGNAL DATA..."
          />
        </div>

        <button 
          onClick={handleBroadcast}
          disabled={isSending || !title || !message}
          className="w-full py-5 bg-accent text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl hover:brightness-110 disabled:opacity-20 transition-all flex items-center justify-center gap-3"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          INITIATE BROADCAST
        </button>
      </div>
    </div>
  );
}
