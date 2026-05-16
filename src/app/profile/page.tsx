
"use client";

import React, { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import AvatarDisplay from '@/components/profile/AvatarDisplay';
import ProfileEditor from '@/components/profile/ProfileEditor';
import BorderGalleryModal from '@/components/profile/BorderGalleryModal';
import { 
  LogOut, Zap, Globe, ShieldCheck, ArrowRight,
  Edit3, LayoutGrid, Grid
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * User Profile Page
 * Optimized for clarity and visual identity.
 */
function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged Out", description: "You have been securely signed out." });
  };

  if (!user) return null;

  const isOwner = user.role === 'owner';
  const isAdmin = user.role === 'admin';

  const getRoleBadge = () => {
    if (isOwner) return { label: 'OWNER', color: 'bg-yellow-500 shadow-yellow-500/20' };
    if (isAdmin) return { label: 'ADMIN', color: 'bg-purple-600 shadow-purple-500/20' };
    if (user.isPremium) return { label: 'PREMIUM', color: 'bg-accent shadow-accent/20' };
    return { label: 'USER', color: 'bg-white/10 shadow-none' };
  };

  const badge = getRoleBadge();

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000 px-4">
      {/* Profile Card */}
      <div className="relative p-10 bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] overflow-hidden group shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col items-center md:flex-row md:items-start gap-12">
          <div className="flex flex-col items-center gap-6 shrink-0">
            <div className="relative">
              <AvatarDisplay 
                src={user.photoURL} 
                name={user.displayName} 
                size="huge" 
                borderId={user.equippedBorder}
              />
              {(user.isPremium || isOwner) && (
                <div className="absolute -bottom-1 -right-1 p-2 bg-yellow-500 text-black rounded-full shadow-2xl z-50 ring-4 ring-[#020205]">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setIsGalleryOpen(true)}
              className="flex items-center gap-3 px-8 py-3.5 bg-accent/10 border border-accent/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all shadow-xl shadow-accent/5 active:scale-95"
            >
              <Grid className="w-4 h-4" /> All Borders
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl font-black tracking-tighter uppercase text-glow leading-none text-white">
                  {user.displayName || 'Anonymous'}
                </h1>
                <span className={cn("px-4 py-1 text-black text-[9px] font-black rounded-lg shadow-xl", badge.color)}>
                  {badge.label}
                </span>
              </div>
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.5em] opacity-80">Account Status: Active</p>
            </div>
            
            <p className="text-[12px] text-neutral-400 font-medium leading-relaxed max-w-lg opacity-60 italic">
              {user.bio || "No biography available."}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button 
                onClick={() => setIsEditorOpen(true)} 
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:border-accent/40 transition-all flex items-center gap-3"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
              
              {(isOwner || isAdmin) && (
                <Link 
                  href="/admin"
                  className="px-8 py-3 bg-yellow-500 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl"
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: Zap, label: 'ENERGY', val: user.isPremium || isOwner ? 'MAX' : '99%' },
          { icon: Globe, label: 'REGION', val: 'Global' },
          { icon: ShieldCheck, label: 'STATUS', val: user.role.toUpperCase() },
        ].map((stat, i) => (
          <div key={i} className="p-8 bg-[#0a0a0f]/60 border border-white/5 rounded-[2.5rem] text-center space-y-1 shadow-2xl backdrop-blur-xl">
            <stat.icon className="w-5 h-5 text-accent mx-auto mb-2 opacity-40" />
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-white tracking-tighter">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Logout Actions */}
      <div className="pt-10">
        <button onClick={handleLogout} className="w-full flex items-center justify-between p-8 bg-red-600/5 border border-red-600/10 rounded-[3rem] group hover:bg-red-600 transition-all shadow-xl">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-3xl bg-red-600/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <LogOut className="w-6 h-6 text-red-500 group-hover:text-white" />
            </div>
            <div className="text-left space-y-1">
              <p className="text-[12px] font-black uppercase tracking-widest text-red-500 group-hover:text-white">Logout</p>
              <p className="text-[8px] text-neutral-600 group-hover:text-white/60 font-black uppercase tracking-widest">Sign out of your account</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-800 group-hover:text-white group-hover:translate-x-2 transition-all" />
        </button>
      </div>

      {/* Profile Editor Sheet */}
      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent side="bottom" className="h-[85vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[4rem] p-0 overflow-hidden">
          <ProfileEditor onClose={() => setIsEditorOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Border Gallery Modal */}
      <BorderGalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
    </div>
  );
}

export default RequireAuth(ProfilePage);
