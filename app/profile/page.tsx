
"use client";

import React from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import AvatarDisplay from '@/components/profile/AvatarDisplay';
import { LogOut, Zap, Globe, ShieldCheck, Edit3 } from 'lucide-react';

function ProfilePage() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-32 animate-in fade-in duration-1000">
      <div className="relative p-8 bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden group">
        <div className="relative z-10 flex flex-col items-center sm:flex-row gap-8">
          <AvatarDisplay src={user.photoURL} name={user.displayName} size="xl" />
          <div className="text-center sm:text-left space-y-4">
            <h1 className="text-3xl font-black tracking-tighter uppercase text-glow leading-none">{user.displayName}</h1>
            <p className="text-[9px] font-black text-accent uppercase tracking-[0.4em]">Account Verified</p>
            <button onClick={logout} className="flex items-center gap-2 px-6 py-2.5 bg-red-600/10 text-red-500 rounded-xl text-[8px] font-black uppercase">
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
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
    </div>
  );
}

export default RequireAuth(ProfilePage);
