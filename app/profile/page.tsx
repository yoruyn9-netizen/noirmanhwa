
"use client";

import React, { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import AvatarDisplay from '@/components/profile/AvatarDisplay';
import ProfileEditor from '@/components/profile/ProfileEditor';
import BannerEditor from '@/components/profile/BannerEditor';
import BorderGalleryModal from '@/components/profile/BorderGalleryModal';
import { 
  LogOut, Zap, Globe, ShieldCheck, ArrowRight,
  Edit3, LayoutGrid, Crown, Star, Grid3X3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * High-Fidelity Profile Matrix
 * Integrates Cloudinary-powered banner editing, border selection, and avatar customization.
 */
function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBorderGalleryOpen, setIsBorderGalleryOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast({ title: "Session Terminated", description: "Identity node disconnected." });
  };

  if (!user) return null;

  const isOwner = user.role === 'owner';
  const isAdmin = user.role === 'admin';

  const getRoleBadge = () => {
    if (isOwner) return { label: 'SUPREME OWNER', color: 'bg-yellow-500 shadow-yellow-500/20' };
    if (isAdmin) return { label: 'SYSTEM MODERATOR', color: 'bg-purple-600 shadow-purple-500/20' };
    if (user.isPremium) return { label: 'PREMIUM NODE', color: 'bg-accent shadow-accent/20' };
    return { label: 'VERIFIED USER', color: 'bg-white/10 shadow-none' };
  };

  const badge = getRoleBadge();

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000">
      {/* Banner Section */}
      <section className="space-y-3 px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black tracking-tighter uppercase text-glow">Profile Banner</h2>
        </div>
        <BannerEditor bannerURL={user.bannerURL} displayName={user.displayName} />
      </section>

      {/* Profile Card */}
      <div className="relative p-10 bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] overflow-hidden group px-2 md:px-10">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col items-center md:flex-row md:items-start gap-10">
          <div className="relative overflow-visible">
             <AvatarDisplay 
                src={user.photoURL} 
                name={user.displayName} 
                size="xl" 
                borderId={user.equippedBorder}
              />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-5">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl font-black tracking-tighter uppercase text-glow leading-none">
                  {user.displayName || 'Anonymous User'}
                </h1>
                <span className={cn("px-4 py-1 text-black text-[9px] font-black rounded-lg shadow-xl transition-all", badge.color)}>
                  {badge.label}
                </span>
              </div>
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.5em] opacity-80">Security Protocol: Verified</p>
            </div>
            
            <p className="text-[12px] text-neutral-400 font-medium leading-relaxed max-w-lg opacity-60 italic">
              {user.bio || "No data entry detected for this synchronization node."}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button 
                onClick={() => setIsEditorOpen(true)} 
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:border-accent/40 transition-all flex items-center gap-3"
              >
                <Edit3 className="w-3.5 h-3.5" /> Calibrate Identity
              </button>
              
              <button
                onClick={() => setIsBorderGalleryOpen(true)}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-accent/20 hover:border-accent/40 transition-all flex items-center gap-3"
              >
                <Grid3X3 className="w-3.5 h-3.5" /> Avatar Frames
              </button>
              
              {(isOwner || isAdmin) && (
                <Link 
                  href="/admin"
                  className="px-8 py-3 bg-yellow-500 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl shadow-yellow-500/10"
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Command Terminal
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2">
        {[
          { icon: Zap, label: 'ENERGY', val: user.isPremium || isOwner ? 'MAX' : '99%' },
          { icon: Globe, label: 'REGION', val: 'Global Matrix' },
          { icon: ShieldCheck, label: 'STATUS', val: user.role.toUpperCase() },
        ].map((stat, i) => (
          <div key={i} className="p-8 bg-[#0a0a0f]/60 border border-white/5 rounded-[2.5rem] text-center space-y-1 shadow-2xl">
            <stat.icon className="w-5 h-5 text-accent mx-auto mb-2 opacity-40" />
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-white tracking-tighter">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Footer Command */}
      <div className="px-2">
        <button onClick={handleLogout} className="w-full flex items-center justify-between p-8 bg-red-600/5 border border-red-600/10 rounded-[2.5rem] group hover:bg-red-600 transition-all shadow-xl">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <LogOut className="w-6 h-6 text-red-500 group-hover:text-white" />
            </div>
            <div className="text-left space-y-1">
              <p className="text-[12px] font-black uppercase tracking-widest text-red-500 group-hover:text-white">Terminate Connection</p>
              <p className="text-[8px] text-neutral-600 group-hover:text-white/60 font-black uppercase tracking-widest">Securely end global synchronization</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-800 group-hover:text-white group-hover:translate-x-2 transition-all" />
        </button>
      </div>

      {/* Modals */}
      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent side="bottom" className="h-[85vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[4rem] p-0 overflow-hidden">
          <ProfileEditor onClose={() => setIsEditorOpen(false)} />
        </SheetContent>
      </Sheet>

      <BorderGalleryModal isOpen={isBorderGalleryOpen} onClose={() => setIsBorderGalleryOpen(false)} />
    </div>
  );
}

export default RequireAuth(ProfilePage);
