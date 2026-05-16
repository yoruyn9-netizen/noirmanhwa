
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useAuthStore } from '@/store/authStore';
import { useAdminStore } from '@/store/adminStore';
import AvatarDisplay from '../profile/AvatarDisplay';
import RoleBadge from '../admin/RoleBadge';
import { 
  X, 
  Calendar, 
  Zap, 
  ShieldAlert, 
  BarChart3, 
  BookOpen, 
  Clock,
  ExternalLink,
  Loader2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const { profile, loading } = useUserProfile(userId);
  const { user: currentUser } = useAuthStore();
  const { banUser, setPremium, isProcessing } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');

  if (!isOpen) return null;

  const isModerator = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const canManage = isModerator && profile?.role !== 'owner'; // Admins can't ban owner

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          onClick={onClose} 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden"
        >
          {loading ? (
            <div className="h-[500px] flex flex-col items-center justify-center space-y-4 opacity-40">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <span className="text-[9px] font-black uppercase tracking-widest">Retrieving Identity Node</span>
            </div>
          ) : !profile ? (
            <div className="h-[400px] flex flex-col items-center justify-center p-10 text-center space-y-6">
              <ShieldAlert className="w-12 h-12 text-red-500/20" />
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase">Node Data Lost</h3>
                <p className="text-[9px] font-black text-neutral-600">The requested profile could not be localized.</p>
              </div>
              <button onClick={onClose} className="px-10 py-3 bg-white/5 rounded-xl text-[9px] font-black">CLOSE</button>
            </div>
          ) : (
            <>
              {/* Header Visual */}
              <div className="h-32 bg-gradient-to-br from-accent/20 via-purple-900/10 to-transparent relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/40 backdrop-blur-md rounded-xl hover:bg-white/10 transition-all z-20">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="px-8 pb-10 -mt-16 relative z-10 space-y-8">
                {/* Avatar & Name */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <AvatarDisplay 
                      src={profile.photoURL} 
                      name={profile.displayName} 
                      size="huge" 
                      borderId={profile.equippedBorder} 
                      className="border-4 border-[#0a0a0f]" 
                    />
                    {profile.isPremium && (
                      <div className="absolute -bottom-1 -right-1 p-2 bg-yellow-500 text-black rounded-full shadow-xl">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-3">
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-glow">{profile.displayName || 'Anonymous'}</h2>
                      <RoleBadge role={profile.role} />
                    </div>
                    <div className="flex items-center justify-center gap-4 text-[8px] font-black text-neutral-600 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Joined {profile.joinedAt?.toDate ? format(profile.joinedAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-800" />
                      <span className={cn(profile.isBanned ? "text-red-500" : "text-green-500")}>
                        {profile.isBanned ? 'STATUS: TERMINATED' : 'STATUS: ACTIVE'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground max-w-sm italic opacity-60">
                    {profile.bio || "No synchronization bio detected."}
                  </p>
                </div>

                {/* Tabs */}
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
                    <BarChart3 className="w-3.5 h-3.5" /> Analytics
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[200px]">
                  {activeTab === 'history' ? (
                    <div className="space-y-3">
                      {!profile.readingHistory || profile.readingHistory.length === 0 ? (
                        <div className="py-10 text-center opacity-40">
                           <p className="text-[9px] font-black uppercase tracking-widest">No reading activity logs</p>
                        </div>
                      ) : (
                        profile.readingHistory.slice(0, 5).map((item) => (
                          <div key={item.mangaId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-accent/40 transition-all">
                             <div className="flex items-center gap-4 min-w-0">
                               <div className="w-8 h-12 rounded-lg bg-neutral-900 overflow-hidden flex-shrink-0">
                                 {item.cover && <img src={item.cover} className="w-full h-full object-cover" alt="" />}
                               </div>
                               <div className="min-w-0">
                                 <p className="text-[10px] font-black text-white truncate uppercase">{item.title}</p>
                                 <p className="text-[8px] font-bold text-accent uppercase tracking-widest">Chapter {item.lastChapter}</p>
                               </div>
                             </div>
                             <Link href={`/manga/${item.mangaId}`} className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                               <ExternalLink className="w-3.5 h-3.5 text-accent" />
                             </Link>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: BookOpen, label: 'TITLES READ', value: profile.stats?.totalMangaRead || 0 },
                        { icon: Zap, label: 'CHAPTERS', value: profile.stats?.totalChaptersRead || 0 },
                        { icon: Clock, label: 'READ TIME', value: `${profile.stats?.totalReadingTime || 0}H` },
                        { icon: ShieldAlert, label: 'REPORTS', value: 0 },
                      ].map((stat, i) => (
                        <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 text-center space-y-1">
                          <stat.icon className="w-4 h-4 text-accent mx-auto mb-2 opacity-40" />
                          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{stat.label}</p>
                          <p className="text-lg font-black text-white">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                {canManage && (
                   <div className="pt-8 border-t border-white/5 space-y-4">
                      <p className="text-[8px] font-black text-red-500/60 uppercase tracking-[0.3em] text-center">Protocol Moderation</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setPremium(profile.uid, !!profile.isPremium)}
                          disabled={isProcessing}
                          className={cn(
                            "flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                            profile.isPremium ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-yellow-500 text-black shadow-xl"
                          )}
                        >
                          {profile.isPremium ? 'REVOKE PREMIUM' : 'GRANT PREMIUM'}
                        </button>
                        <button 
                          onClick={() => banUser(profile.uid, !!profile.isBanned)}
                          disabled={isProcessing}
                          className={cn(
                            "flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                            profile.isBanned ? "bg-green-500 text-black" : "bg-red-500 text-white shadow-xl"
                          )}
                        >
                          {profile.isBanned ? 'REINSTATE NODE' : 'TERMINATE NODE'}
                        </button>
                      </div>
                   </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
