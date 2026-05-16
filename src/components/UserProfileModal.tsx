"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/use-user-profile';
import AvatarDisplay from '@/components/profile/AvatarDisplay';
import RoleBadge from '@/components/admin/RoleBadge';
import { X, Calendar, Zap, ShieldAlert, BarChart3, BookOpen, Clock, ExternalLink, Loader2, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const { profile, loading } = useUserProfile(userId);
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');

  if (!isOpen || !userId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="relative w-full max-w-2xl mx-auto bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh]"
        >
          {loading ? (
            <div className="h-[500px] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Loading profile...</span>
            </div>
          ) : !profile ? (
            <div className="h-[400px] flex flex-col items-center justify-center p-10 text-center space-y-6">
              <ShieldAlert className="w-12 h-12 text-red-500/30" />
              <h3 className="text-sm font-black uppercase">Profile Not Found</h3>
              <p className="text-[10px] text-neutral-500">The requested profile could not be retrieved.</p>
              <button
                onClick={onClose}
                className="px-10 py-3 bg-accent text-black rounded-2xl uppercase text-[9px] font-black tracking-widest"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="h-32 bg-white/5 relative overflow-hidden">
                {profile.bannerURL ? (
                  <img src={profile.bannerURL} alt="banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent/20 to-transparent" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent opacity-80" />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-3 bg-black/50 rounded-2xl hover:bg-white/10 transition-all z-10"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="px-8 pb-10 -mt-16 relative z-10 space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative inline-block">
                    <AvatarDisplay
                      src={profile.photoURL}
                      name={profile.displayName}
                      size="huge"
                      borderId={profile.equippedBorder}
                      className="ring-[12px] ring-[#0a0a0f]"
                    />
                    {(profile.isPremium || profile.role !== 'user') && (
                      <div className="absolute -bottom-2 -right-2 p-2 bg-yellow-500 text-black rounded-full shadow-2xl z-50 ring-4 ring-[#0a0a0f]">
                        {profile.role === 'owner' ? <Crown className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{profile.displayName || 'Anonymous'}</h2>
                      <RoleBadge role={profile.role} />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-[8px] font-black text-neutral-400 uppercase tracking-[0.4em]">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Joined {profile.joinedAt?.toDate ? format(profile.joinedAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
                      <span className={cn(profile.isBanned ? 'text-red-500' : 'text-green-500')}>
                        {profile.isBanned ? 'STATUS: TERMINATED' : 'STATUS: ACTIVE'}
                      </span>
                    </div>
                  </div>

                  <p className="max-w-xl text-[11px] text-neutral-400 leading-relaxed bg-white/5 p-4 rounded-3xl border border-white/5">
                    {profile.bio || 'No profile description available.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl">
                  <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                      'flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                      activeTab === 'history' ? 'bg-accent text-white' : 'text-neutral-500 hover:text-white'
                    )}
                  >
                    <BookOpen className="w-3.5 h-3.5 inline mr-2" /> History
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={cn(
                      'flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                      activeTab === 'stats' ? 'bg-accent text-white' : 'text-neutral-500 hover:text-white'
                    )}
                  >
                    <BarChart3 className="w-3.5 h-3.5 inline mr-2" /> Stats
                  </button>
                </div>

                <div className="min-h-[160px] space-y-4">
                  {activeTab === 'history' ? (
                    <div className="space-y-3">
                      {!profile.readingHistory || profile.readingHistory.length === 0 ? (
                        <div className="py-12 text-center opacity-40">
                          <p className="text-[10px] font-black uppercase tracking-widest">No activity logs available.</p>
                        </div>
                      ) : (
                        profile.readingHistory.slice(0, 5).map((item: any) => (
                          <Link
                            key={`${item.mangaId}-${item.lastChapter || item.chapterNum || ''}`}
                            href={`/manga/${item.mangaId}`}
                            className="group flex items-center justify-between rounded-3xl border border-white/5 bg-white/5 p-4 transition-all hover:border-accent/40"
                          >
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-tight truncate text-white">{item.title || 'Unknown Manga'}</p>
                              <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-neutral-400">Chapter {item.lastChapter || item.chapterNum || 'N/A'}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-accent opacity-70 group-hover:opacity-100" />
                          </Link>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: BookOpen, label: 'TITLES READ', value: profile.stats?.totalMangaRead || 0 },
                        { icon: Zap, label: 'CHAPTERS', value: profile.stats?.totalChaptersRead || 0 },
                        { icon: Clock, label: 'READ TIME', value: `${profile.stats?.totalReadingTime || 0}H` },
                        { icon: ShieldAlert, label: 'FAV GENRE', value: profile.stats?.favoriteGenre || 'N/A' }
                      ].map((stat, index) => (
                        <div key={index} className="rounded-3xl border border-white/5 bg-white/5 p-5 text-center">
                          <stat.icon className="mx-auto mb-3 w-5 h-5 text-accent" />
                          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-500">{stat.label}</p>
                          <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
