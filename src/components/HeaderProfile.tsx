"use client";

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import AvatarDisplay from './profile/AvatarDisplay';
import { useRouter } from 'next/navigation';
import { User, LogIn, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function HeaderProfile() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);

  const handleAction = () => {
    if (user) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
    setShowPopup(false);
  };

  return (
    <div className="relative">
      {/* Header Profile Trigger */}
      <button 
        onClick={() => setShowPopup(!showPopup)}
        className="flex items-center gap-3 p-1.5 bg-[#0a0a0f]/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-accent/40 transition-all duration-500 group active:scale-95"
      >
        <AvatarDisplay 
          src={user?.photoURL} 
          name={user?.displayName} 
          size="sm" 
          borderId={user?.equippedBorder}
          className="group-hover:scale-105 transition-transform"
        />
        <div className="pr-3 text-left">
          <p className="text-[9px] font-black uppercase tracking-tight text-white group-hover:text-accent transition-colors truncate max-w-[100px]">
            {user?.displayName || 'Guest User'}
          </p>
          <p className="text-[6px] font-bold text-neutral-600 uppercase tracking-widest leading-none">
            {user ? 'Verified Node' : 'Disconnected'}
          </p>
        </div>
      </button>

      {/* Action Popup */}
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
                  <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">System Menu</span>
                  <button onClick={() => setShowPopup(false)}><X className="w-3 h-3 text-neutral-700" /></button>
                </div>

                {user ? (
                  <button 
                    onClick={handleAction}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-accent hover:border-accent group transition-all"
                  >
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/20">
                      <Edit3 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Edit Profile</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleAction}
                    className="w-full flex items-center gap-3 p-3 bg-accent border border-accent/20 rounded-xl hover:brightness-110 shadow-lg shadow-accent/20 group transition-all"
                  >
                    <div className="p-2 bg-white/20 rounded-lg">
                      <LogIn className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white block">Login with Google</span>
                      <span className="text-[6px] font-bold text-white/60 uppercase tracking-widest">Connect Identity Node</span>
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
