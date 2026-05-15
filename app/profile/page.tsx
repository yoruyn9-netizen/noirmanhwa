
"use client";

import React, { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import AvatarDisplay from '@/components/profile/AvatarDisplay';
import { LogOut, Zap, Globe, ShieldCheck, Edit3, X, User as UserIcon } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { openPanel, closePanel } = useUIStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  if (!user) return null;

  const handleEditorOpenChange = (open: boolean) => {
    setIsEditorOpen(open);
    if (open) {
      openPanel('profile');
    } else {
      closePanel();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-32 animate-in fade-in duration-1000">
      <div className="relative p-8 bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden group">
        <div className="relative z-10 flex flex-col items-center sm:flex-row gap-8">
          <AvatarDisplay src={user.photoURL} name={user.displayName} size="xl" />
          <div className="text-center sm:text-left space-y-4">
            <h1 className="text-3xl font-black tracking-tighter uppercase text-glow leading-none">{user.displayName}</h1>
            <p className="text-[9px] font-black text-accent uppercase tracking-[0.4em]">Account Verified</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button 
                onClick={() => handleEditorOpenChange(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <Edit3 className="w-3 h-3" /> Edit Profile
              </button>
              <button onClick={logout} className="flex items-center gap-2 px-6 py-2.5 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Zap, label: 'ENERGY', val: user.isPremium ? 'MAX' : '99%' },
          { icon: Globe, label: 'REGION', val: 'Global' },
          { icon: ShieldCheck, label: 'ROLE', val: user.role.toUpperCase() },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-[#0a0a0f]/60 border border-white/5 rounded-3xl text-center">
            <stat.icon className="w-4 h-4 text-accent mx-auto mb-1 opacity-40" />
            <p className="text-[8px] font-black text-neutral-500 uppercase">{stat.label}</p>
            <p className="text-xl font-black text-white">{stat.val}</p>
          </div>
        ))}
      </div>

      <Sheet open={isEditorOpen} onOpenChange={handleEditorOpenChange}>
        <SheetContent side="bottom" className="h-[60vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] p-10">
          <SheetHeader className="mb-10 text-center">
             <SheetTitle className="text-2xl font-black uppercase tracking-tighter text-glow">Identity Recalibration</SheetTitle>
             <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Adjusting system parameters</p>
          </SheetHeader>
          <div className="space-y-8 max-w-md mx-auto">
             <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-accent ml-2">Public Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-accent transition-colors" />
                  <input 
                    type="text" 
                    defaultValue={user.displayName || ''} 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[11px] uppercase tracking-widest"
                    placeholder="ENTER SIGNATURE..."
                  />
                </div>
             </div>
             <button className="w-full py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-accent hover:text-white transition-all">
                Update Data Node
             </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default RequireAuth(ProfilePage);
