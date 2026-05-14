
"use client";

import React, { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import AvatarDisplay from '@/components/profile/AvatarDisplay';
import ProfileEditor from '@/components/profile/ProfileEditor';
import BorderSelector from '@/components/profile/BorderSelector';
import UserManagement from '@/components/admin/UserManagement';
import { 
  LogOut, Zap, Globe, ShieldCheck, ArrowRight,
  Edit3, Users, LayoutGrid, Clock, BookOpen, Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Link from 'next/link';

function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged Out", description: "Your session has ended." });
  };

  if (!user) return null;

  const isOwner = user.role === 'owner';

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-32 animate-in fade-in duration-1000">
      {/* Profile Card */}
      <div className="relative p-8 bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-start gap-8">
          <AvatarDisplay 
            src={user.photoURL} 
            name={user.displayName} 
            size="xl" 
            borderId={user.equippedBorder}
          />
          
          <div className="flex-1 text-center sm:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <h1 className="text-3xl font-black tracking-tighter uppercase text-glow leading-none">
                  {user.displayName || 'Guest User'}
                </h1>
                {user.isPremium && <span className="px-3 py-1 bg-yellow-500 text-black text-[8px] font-black rounded-full">PREMIUM</span>}
              </div>
              <p className="text-[9px] font-black text-accent uppercase tracking-[0.4em]">Account Verified</p>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed opacity-60 italic line-clamp-2">
              {user.bio || "No synchronization bio detected."}
            </p>
            <button onClick={() => setIsEditorOpen(true)} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 mx-auto sm:mx-0">
              <Edit3 className="w-3 h-3" /> Edit Profile
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
          <div key={i} className="p-6 bg-[#0a0a0f]/60 border border-white/5 rounded-3xl text-center space-y-1">
            <stat.icon className="w-4 h-4 text-accent mx-auto mb-1 opacity-40" />
            <p className="text-[8px] font-black text-neutral-500 uppercase">{stat.label}</p>
            <p className="text-xl font-black text-white">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Border Selector Section */}
      <section className="p-8 bg-[#0a0a0f]/40 border border-white/5 rounded-[3rem]">
        <BorderSelector />
      </section>

      {/* Admin Section */}
      {isOwner && (
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] px-4 text-neutral-600 flex items-center gap-3">
             <LayoutGrid className="w-3 h-3" /> System Control
          </h3>
          <UserManagement />
        </section>
      )}

      {/* Footer Actions */}
      <section className="space-y-3">
        <button onClick={handleLogout} className="w-full flex items-center justify-between p-6 bg-red-600/5 border border-red-600/10 rounded-3xl group hover:bg-red-600 transition-all">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center group-hover:bg-white/20">
              <LogOut className="w-5 h-5 text-red-500 group-hover:text-white" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-widest text-red-500 group-hover:text-white">Sign Out</p>
              <p className="text-[8px] text-red-900 group-hover:text-white/60 font-black uppercase tracking-widest">Securely end session</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-red-900 group-hover:text-white transition-all" />
        </button>
      </section>

      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent side="bottom" className="h-[80vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] p-0 overflow-y-auto">
          <ProfileEditor onClose={() => setIsEditorOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default RequireAuth(ProfilePage);
