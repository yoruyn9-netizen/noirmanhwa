
"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import AvatarDisplay from './profile/AvatarDisplay';
import { useRouter } from 'next/navigation';
import { Bell, Edit3, LogIn, X, User, Crown, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToNotifications } from '@/lib/firestore';
import { cn } from '@/lib/utils';

const borderMap: Record<string, string> = {
  'ink-master': 'https://i.ibb.co.com/DgDsKgVh/9b6b3710-d9a6-42ce-9237-0a4655ecd205-20260516-032637-0000.png',
  'cyber-core': 'https://i.ibb.co.com/JR5FhyDW/f0d15853-c7ab-4a2a-a14e-8e0d2ba6c330-20260516-032602-0000.png',
  'celestial-dream': 'https://i.ibb.co.com/n85NZRVB/c3d098ec-c12d-4ece-b742-adc657357290-20260516-032528-0000.png',
  'stellar-compass': 'https://i.ibb.co.com/LdzzJtRW/823e8e96-4d93-49dc-be69-36c49b67a1b8-20260516-032451-0000.png'
};

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

  const getRoleDisplay = (role?: string, isPremium?: boolean) => {
    if (role === 'owner') return { text: 'Supreme Authority', color: 'text-yellow-500', icon: Crown };
    if (role === 'admin') return { text: 'System Moderator', color: 'text-purple-500', icon: ShieldCheck };
    if (isPremium) return { text: 'Premium Node', color: 'text-pink-500', icon: Zap };
    return { text: 'Verified Node', color: 'text-neutral-600', icon: User };
  };

  const roleInfo = getRoleDisplay(user?.role, user?.isPremium);

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
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#020205] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
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
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-accent">Broadcasting Center</span>
                  <button onClick={() => setShowNotifs(false)}><X className="w-3 h-3 text-neutral-700" /></button>
                </div>
                <div className="max-h-64 overflow-y-auto p-4 space-y-3 custom-scrollbar">
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
            <p className={cn("text-[6px] font-bold uppercase tracking-widest leading-none", roleInfo.color)}>
              {roleInfo.text}
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
                className="absolute top-full left-0 mt-3 w-64 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[150] overflow-hidden"
              >
                <div className="p-4 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Identity Protocol</span>
                    <button onClick={() => setShowPopup(false)}><X className="w-3 h-3 text-neutral-700" /></button>
                  </div>

                  {user ? (
                    <div className="space-y-4">
                      {/* Identity Header in Popup - Strict Manual Stacking */}
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 relative overflow-visible">
                        <div className="relative inline-block">
                          {/* BASE AVATAR (z-10) */}
                          <div className="relative z-10">
                            <AvatarDisplay 
                              src={user.photoURL} 
                              name={user.displayName} 
                              size="md" 
                            />
                          </div>
                          
                          {/* BORDER OVERLAY (z-10 absolute) */}
                          {user.equippedBorder && borderMap[user.equippedBorder] && (
                            <img 
                              src={borderMap[user.equippedBorder]} 
                              alt="Border"
                              className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none" 
                              style={{ transform: 'scale(1.28)' }}
                              draggable={false}
                            />
                          )}

                          {/* AUTHORITY BADGE (z-50) */}
                          {(user.isPremium || user.role !== 'user') && (
                            <div 
                              className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300"
                              style={{ zIndex: 50 }}
                            >
                              <Zap className="w-3.5 h-3.5 text-black fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-white uppercase truncate">{user.displayName}</p>
                          <p className={cn("text-[7px] font-bold uppercase tracking-widest", roleInfo.color)}>{roleInfo.text}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => { router.push('/profile'); setShowPopup(false); }}
                        className="w-full flex items-center gap-3 p-3 bg-accent text-white rounded-xl hover:brightness-110 transition-all shadow-lg shadow-accent/20"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Edit Profile</span>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { router.push('/login'); setShowPopup(false); }}
                      className="w-full flex items-center gap-3 p-3 bg-accent rounded-xl hover:brightness-110 shadow-lg shadow-accent/20 transition-all"
                    >
                      <LogIn className="w-4 h-4 text-white" />
                      <div className="text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white block">Sign In</span>
                        <span className="text-[6px] font-bold text-white/60 uppercase tracking-widest leading-none">Access Matrix</span>
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
