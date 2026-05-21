
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
  Edit3, LayoutGrid, Crown, Star, Grid3X3, Eye,
  Calendar, ShieldAlert, BarChart3, BookOpen, Clock, ExternalLink, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import RoleBadge from '@/components/admin/RoleBadge';

/**
 * High-Fidelity Profile Matrix
 * Integrates Cloudinary-powered banner editing, border selection, and avatar customization.
 */
function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBorderGalleryOpen, setIsBorderGalleryOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');

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
          <h2 className="text-sm font-black tracking-tighter uppercase text-glow">Profile Matrix</h2>
          <button 
            onClick={() => setIsOverviewOpen(true)} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Preview Profile Card"
          >
            <Eye className="w-4 h-4 text-accent" />
          </button>
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

      {/* Modals & Sheets */}
      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent side="bottom" className="h-[85vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[4rem] p-0 overflow-hidden">
          <ProfileEditor onClose={() => setIsEditorOpen(false)} />
        </SheetContent>
      </Sheet>

      <BorderGalleryModal isOpen={isBorderGalleryOpen} onClose={() => setIsBorderGalleryOpen(false)} />

      <Sheet open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-transparent border-none p-0">
          <div className="relative w-full h-full bg-[#0a0a0f] border-l border-white/5 shadow-2xl overflow-y-auto custom-scrollbar">
            <button onClick={() => setIsOverviewOpen(false)} className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-md rounded-2xl hover:bg-white/10 transition-all z-[100]">
                <X className="w-5 h-5 text-white" />
            </button>

            <div className="mt-6 mx-6 h-48 sm:h-56 rounded-2xl overflow-hidden relative">
              {user.bannerURL ? (
                <img src={user.bannerURL} className="w-full h-full object-cover aspect-[16/9]" alt="User banner" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-transparent aspect-[16/9]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0f]/80" />
            </div>

            <div className="px-8 pb-8 -mt-[60px] relative z-10 space-y-8">
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="relative inline-block">
                  <AvatarDisplay 
                    src={user.photoURL} 
                    name={user.displayName} 
                    size="huge" 
                    borderId={user.equippedBorder}
                    className="rounded-full ring-8 ring-[#0a0a0f] bg-[#0a0a0f] object-cover"
                  />
                  {(user.isPremium || user.role !== 'user') && (
                    <div className="absolute -bottom-1 -right-1 p-2 bg-yellow-500 text-black rounded-full shadow-2xl z-[100] ring-4 ring-[#0a0a0f]">
                      {user.role === 'owner' ? <Crown className="w-5 h-5 fill-current" /> : <Zap className="w-5 h-5 fill-current" />}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-glow text-white">{user.displayName || 'Anonymous'}</h2>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[8px] font-black text-neutral-600 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Joined {user.joinedAt?.toDate ? format(user.joinedAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-800" />
                    <span className={cn(user.isBanned ? "text-red-500" : "text-green-500")}>
                      {user.isBanned ? 'STATUS: TERMINATED' : 'STATUS: ACTIVE'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 max-w-sm italic opacity-80 bg-white/5 p-4 rounded-2xl border border-white/5">
                  {user.bio || "No synchronization bio detected."}
                </p>
              </div>

              <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl">
                <button 
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'history' ? "bg-accent text-white shadow-lg" : "text-neutral-500 hover:text-white"
                  )}
                >
                  <BookOpen className="w-3.5 h-3.5" /> History
                </button>
                <button 
                  onClick={() => setActiveTab('stats')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'stats' ? "bg-accent text-white shadow-lg" : "text-neutral-500 hover:text-white"
                  )}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Stats
                </button>
              </div>

              <div className="min-h-[160px]">
                {activeTab === 'history' ? (
                  <div className="space-y-3">
                    {!user.readingHistory || user.readingHistory.length === 0 ? (
                      <div className="py-12 text-center opacity-30">
                         <p className="text-[10px] font-black uppercase tracking-widest">No activity logs</p>
                      </div>
                    ) : (
                      user.readingHistory.slice(0, 5).map((item: any) => (
                        <div key={item.mangaId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-accent/40 transition-all">
                           <div className="flex items-center gap-4 min-w-0">
                             <div className="w-10 h-14 rounded-xl bg-neutral-900 overflow-hidden flex-shrink-0">
                               {item.cover && <img src={item.cover} className="w-full h-full object-cover" alt="" />}
                             </div>
                             <div className="min-w-0">
                               <p className="text-[10px] font-black text-white truncate uppercase">{item.title}</p>
                               <p className="text-[7px] font-black text-accent uppercase tracking-widest">Chapter {item.lastChapter}</p>
                             </div>
                           </div>
                           <Link href={`/manga/${item.mangaId}`} className="p-2.5 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                             <ExternalLink className="w-4 h-4 text-accent" />
                           </Link>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: BookOpen, label: 'TITLES READ', value: user.stats?.totalMangaRead || 0 },
                      { icon: Zap, label: 'CHAPTERS', value: user.stats?.totalChaptersRead || 0 },
                      { icon: Clock, label: 'READ TIME', value: `${user.stats?.totalReadingTime || 0}H` },
                      { icon: ShieldAlert, label: 'REPORTS', value: 0 },
                    ].map((stat, i) => (
                      <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center space-y-1 shadow-lg">
                        <stat.icon className="w-5 h-5 text-accent mx-auto mb-2 opacity-40" />
                        <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default RequireAuth(ProfilePage);
