
"use client";

import React from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import OwnerBadge from '@/components/auth/OwnerBadge';
import { 
  LogOut, 
  Settings, 
  User, 
  Zap, 
  Shield, 
  Globe, 
  Database,
  ArrowRight,
  Terminal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Signal Terminated", description: "Identity offline." });
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000">
      {/* Identity Node */}
      <div className="relative p-10 bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-40" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />

        <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-start gap-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-accent/5 border border-accent/20 flex items-center justify-center overflow-hidden shadow-2xl">
              {user.photoURL ? (
                <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <User className="w-10 h-10 text-accent" />
              )}
            </div>
            {user.role === 'owner' && (
              <div className="absolute -bottom-4 -right-4">
                <OwnerBadge />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter uppercase text-glow leading-none">
                {user.displayName || 'Anonymous Node'}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <span className="text-[9px] font-black text-accent uppercase tracking-[0.4em]">Signal: Verified</span>
                <span className="text-[7px] text-neutral-600 font-bold uppercase tracking-widest">{user.email}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed opacity-60">
              Identity synchronized across global Manhwa nodes. Authorized for high-fidelity signal extraction.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Zap, label: 'Energy', val: '99%' },
          { icon: Globe, label: 'Nodes', val: 'Global' },
          { icon: Database, label: 'Cache', val: '4.2MB' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-3xl text-center space-y-1 group hover:border-accent/30 transition-all shadow-xl">
            <stat.icon className="w-4 h-4 text-accent mx-auto mb-1 opacity-40 group-hover:opacity-100 transition-opacity" />
            <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl font-black text-white">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] px-4 text-neutral-600">Preferences</h3>
        <div className="grid gap-3">
          <button className="flex items-center justify-between p-6 bg-[#0a0a0f]/60 border border-white/5 rounded-3xl group hover:border-accent/40 transition-all">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center border border-accent/10">
                <Settings className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black uppercase tracking-widest">Neural Config</p>
                <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Interface calibration</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-800 group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </button>

          {user.role === 'owner' && (
            <button className="flex items-center justify-between p-6 bg-accent/5 border border-accent/20 rounded-3xl group hover:bg-accent/10 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase tracking-widest text-accent">Owner Console</p>
                  <p className="text-[8px] text-accent/60 font-black uppercase tracking-widest">High-level overrides</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-all" />
            </button>
          )}

          <button 
            onClick={handleLogout}
            className="flex items-center justify-between p-6 bg-red-600/5 border border-red-600/10 rounded-3xl group hover:bg-red-600 transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center group-hover:bg-white/20">
                <LogOut className="w-5 h-5 text-red-500 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black uppercase tracking-widest text-red-500 group-hover:text-white">Terminate Session</p>
                <p className="text-[8px] text-red-900 group-hover:text-white/60 font-black uppercase tracking-widest">Identity purge</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-red-900 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </section>
    </div>
  );
}

export default RequireAuth(ProfilePage);
