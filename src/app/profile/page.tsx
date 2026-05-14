
"use client";

import React, { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import OwnerBadge from '@/components/auth/OwnerBadge';
import ProfileEditor from '@/components/profile/ProfileEditor';
import { 
  LogOut, 
  Settings, 
  User, 
  Zap, 
  Globe, 
  Database,
  ArrowRight,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Edit3,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from 'next/link';

function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast({ title: "Signal Terminated", description: "Identity offline." });
  };

  if (!user) return null;

  // Safe access for role and status
  const userRole = user.role || 'user';
  const isOwner = userRole === 'owner';

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
            {isOwner && (
              <div className="absolute -bottom-4 -right-4">
                <OwnerBadge />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <h1 className="text-3xl font-black tracking-tighter uppercase text-glow leading-none">
                  {user.displayName || 'Anonymous Node'}
                </h1>
                {user.isPremium && (
                  <div className="px-3 py-1 bg-yellow-500 text-black text-[8px] font-black rounded-full shadow-lg shadow-yellow-500/20">PREMIUM</div>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <span className="text-[9px] font-black text-accent uppercase tracking-[0.4em]">Signal: Verified</span>
                <span className="text-[7px] text-neutral-600 font-bold uppercase tracking-widest">{user.email || 'Private Uplink'}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed opacity-60 italic">
              {user.bio || "No identity sub-routine bio detected. Initializing default personality matrix."}
            </p>
            <button 
              onClick={() => setIsEditorOpen(true)}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-2 mx-auto sm:mx-0"
            >
              <Edit3 className="w-3 h-3" /> Edit Sub-Routine
            </button>
          </div>
        </div>
      </div>

      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent side="bottom" className="h-[80vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] p-0 overflow-y-auto">
          <ProfileEditor onClose={() => setIsEditorOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Stats Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Zap, label: 'Energy', val: user.isPremium ? 'MAX' : '99%' },
          { icon: Globe, label: 'Nodes', val: 'Global' },
          { icon: ShieldCheck, label: 'Access', val: userRole.toUpperCase() },
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
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] px-4 text-neutral-600">Administrative Protocols</h3>
        <div className="grid gap-3">
          {isOwner && (
            <>
              <Link href="/admin/users" className="flex items-center justify-between p-6 bg-accent/5 border border-accent/20 rounded-3xl group hover:bg-accent/10 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase tracking-widest text-accent">Node Grid Controller</p>
                    <p className="text-[8px] text-accent/60 font-black uppercase tracking-widest">Manage User Permissions & Premium</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-all" />
              </Link>

              <Link href="/admin/reports" className="flex items-center justify-between p-6 bg-red-600/5 border border-red-600/20 rounded-3xl group hover:bg-red-600/10 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase tracking-widest text-red-500">Anomaly Dashboard</p>
                    <p className="text-[8px] text-red-900 font-black uppercase tracking-widest">Review Bug & Data Reports</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-red-900 group-hover:translate-x-1 transition-all" />
              </Link>
            </>
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
