
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/use-user-profile';
import AvatarDisplay from './AvatarDisplay';
import RoleBadge from '../admin/RoleBadge';
import { 
  X, Calendar, BookOpen, Clock, 
  ExternalLink, Loader2, Zap, BarChart3 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ProfileViewModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileViewModal({ userId, isOpen, onClose }: ProfileViewModalProps) {
  const { profile, loading } = useUserProfile(userId);
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
          onClick={onClose} 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden"
        >
          {loading ? (
            <div className="h-[500px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Retrieving Identity Node</span>
            </div>
          ) : !profile ? (
            <div className="h-[400px] flex flex-col items-center justify-center p-10 text-center">
              <X className="w-12 h-12 text-red-500/20" />
              <h3 className="text-sm font-black uppercase">Identity Lost</h3>
              <button onClick={onClose} className="mt-6 px-10 py-3 bg-white/5 rounded-xl text-[9px] font-black">CLOSE</button>
            </div>
          ) : (
            <>
              {/* Cover Gradient */}
              <div className="h-32 bg-gradient-to-br from-accent/20 via-purple-900/10 to-transparent relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/40 rounded-xl hover:bg-white/10">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="px-8 pb-10 -mt-16 relative z-10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <AvatarDisplay 
                    src={profile.photoURL} 
                    name={profile.displayName} 
                    size="huge" 
                    borderId={profile.equippedBorder}
                    className="border-4 border-[#0a0a0f]" 
                  />
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-3">
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-glow">{profile.displayName || 'Anonymous'}</h2>
                      <RoleBadge role={profile.role} />
                    </div>
                    <div className="flex items-center justify-center gap-4 text-[8px] font-black text-neutral-600 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Joined {profile.joinedAt?.toDate ? format(profile.joinedAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
                      {profile.isPremium && <span className="text-yellow-500 flex items-center gap-1"><Zap className="w-2.5 h-2.5 fill-current" /> PREMIUM</span>}
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground max-w-sm italic opacity-60">
                    {profile.bio || "No data entry for this sub-node."}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl">
                  <button onClick={() => setActiveTab('history')} className={cn("flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all", activeTab === 'history' ? "bg-accent text-white" : "text-neutral-500")}>
                    History
                  </button>
                  <button onClick={() => setActiveTab('stats')} className={cn("flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all", activeTab === 'stats' ? "bg-accent text-white" : "text-neutral-500")}>
                    Analytics
                  </button>
                </div>

                <div className="mt-6 min-h-[160px] max-h-64 overflow-y-auto hide-scrollbar">
                  {activeTab === 'history' ? (
                    <div className="space-y-3">
                      {!profile.readingHistory || profile.readingHistory.length === 0 ? (
                        <p className="text-center text-[9px] font-black text-neutral-700 py-10 uppercase tracking-widest">No activity logs</p>
                      ) : (
                        profile.readingHistory.slice(0, 5).map((item: any) => (
                          <Link key={item.mangaId} href={`/series/${item.mangaId}`} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-accent/40 transition-all">
                             <div className="flex items-center gap-3">
                               <p className="text-[10px] font-black text-white uppercase truncate">{item.title || 'Manga Node'}</p>
                               <span className="text-[8px] font-bold text-accent">CH. {item.chapterNum}</span>
                             </div>
                             <ExternalLink className="w-3 h-3 text-neutral-700 group-hover:text-accent transition-colors" />
                          </Link>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: BookOpen, label: 'TITLES', value: profile.stats?.totalMangaRead || 0 },
                        { icon: Zap, label: 'CHAPTERS', value: profile.stats?.totalChaptersRead || 0 },
                      ].map((stat, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                          <p className="text-[7px] font-black text-neutral-600 uppercase mb-1">{stat.label}</p>
                          <p className="text-lg font-black text-white">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
