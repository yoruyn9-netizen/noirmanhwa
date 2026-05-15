
"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import AvatarDisplay from './profile/AvatarDisplay';
import { useRouter } from 'next/navigation';
import { Bell, Edit3, LogIn, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToNotifications } from '@/lib/firestore';
import { cn } from '@/lib/utils';

export default function HeaderProfile() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const unsub = subscribeToNotifications((notifs) => {
      setNotifications(notifs);
      if (notifs.length > 0) setHasNew(true);
    });
    return () => unsub();
  }, []);

  const handleAction = () => {
    if (user) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
    setShowPopup(false);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Notification Bell */}
      <div className="relative">
        <button 
          onClick={() => { setShowNotifs(!showNotifs); setHasNew(false); }}
          className="p-3 bg-[#0a0a0f]/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-accent/40 transition-all relative group"
        >
          <Bell className={cn("w-5 h-5 transition-colors", hasNew ? "text-accent animate-pulse" : "text-neutral-500 group-hover:text-white")} />
          {hasNew && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#020205] shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          )}
        </button>

        <AnimatePresence>
          {showNotifs && (
            <>
              <div className="fixed inset-0 z-[140]" onClick={() => setShowNotifs(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 mt-3 w-72 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[150] overflow-hidden"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-accent">Broadcasting Center</span>
                  <button onClick={() => setShowNotifs(false)}><X className="w-3 h-3 text-neutral-700" /></button>
                </div>
                <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-[8px] font-black text-neutral-600 uppercase text-center py-4">No active signals</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                        <p className="text-[10px] font-black text-white uppercase">{n.title}</p>
                        <p className="text-[9px] text-neutral-400 font-medium leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* User Node */}
      <div className="relative">
        <button 
          onClick={() => setShowPopup(!showPopup)}
          className="flex items-center gap-3 p-1.5 bg-[#0a0a0f]/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-accent/40 transition-all group"
        >
          <AvatarDisplay 
            src={user?.photoURL} 
            name={user?.displayName} 
            size="sm" 
            borderId={user?.equippedBorder}
          />
          <div className="pr-3 text-left">
            <p className="text-[9px] font-black uppercase tracking-tight text-white truncate max-w-[100px]">
              {user?.displayName || 'Guest User'}
            </p>
            <p className={cn(
              "text-[6px] font-bold uppercase tracking-widest leading-none",
              user?.role === 'owner' ? "text-yellow-500" : "text-neutral-600"
            )}>
              {user?.role === 'owner' ? 'Supreme Authority' : user ? 'Verified Node' : 'Disconnected'}
            </p>
          </div>
        </button>

        <AnimatePresence>
          {showPopup && (
            <>
              <div className="fixed inset-0 z-[140]" onClick={() => setShowPopup(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 mt-3 w-56 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[150] overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Identity Actions</span>
                    <button onClick={() => setShowPopup(false)}><X className="w-3 h-3 text-neutral-700" /></button>
                  </div>

                  {user ? (
                    <button 
                      onClick={handleAction}
                      className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-accent group transition-all"
                    >
                      <Edit3 className="w-4 h-4 text-white" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Profile Control</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => router.push('/login')}
                      className="w-full flex items-center gap-3 p-3 bg-accent rounded-xl hover:brightness-110 shadow-lg shadow-accent/20 transition-all"
                    >
                      <LogIn className="w-4 h-4 text-white" />
                      <div className="text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white block">Sign In</span>
                        <span className="text-[6px] font-bold text-white/60 uppercase tracking-widest leading-none">Connect Protocol</span>
                      </div>
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
