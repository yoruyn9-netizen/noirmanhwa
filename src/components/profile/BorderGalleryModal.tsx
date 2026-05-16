
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { X, Lock, Check, Sparkles, Loader2, Award, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import AvatarDisplay from './AvatarDisplay';

interface BorderGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPECIAL_BORDERS = [
  { id: 'ink-master', name: 'Ink Master', tier: 'EVENT TIER' },
  { id: 'cyber-core', name: 'Cyber Core', tier: 'PREMIUM TIER' },
  { id: 'celestial-dream', name: 'Celestial Dream', tier: 'EVENT TIER' },
  { id: 'stellar-compass', name: 'Stellar Compass', tier: 'LEGEND TIER' },
];

const RANK_BORDERS = [
  { id: 'bronze-glow', name: 'Bronze Seal', tier: 'USER TIER' },
  { id: 'silver-shimmer', name: 'Silver Guardian', tier: 'PREMIUM TIER' },
  { id: 'gold-admin', name: 'Golden Sentinel', tier: 'MODERATOR TIER' },
  { id: 'legend-owner', name: 'Supreme Authority', tier: 'OWNER TIER' },
];

export default function BorderGalleryModal({ isOpen, onClose }: BorderGalleryModalProps) {
  const { user, updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  const [isEquipping, setIsEquipping] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const isOwner = user.role === 'owner';
  
  const handleEquip = async (borderId: string) => {
    setIsEquipping(borderId);
    try {
      await updateUserProfile(user.uid, { equippedBorder: borderId });
      updateUserInStore({ equippedBorder: borderId });
      toast({
        title: "Protocol Synced",
        description: `Identity frame ${borderId === 'none' ? 'removed' : 'equipped'}.`,
      });
      setTimeout(onClose, 500);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Identity relay failed." });
    } finally {
      setIsEquipping(null);
    }
  };

  const isUnlocked = (id: string) => {
    if (isOwner) return true;
    if (id === 'none') return true;
    return user.ownedBorders?.includes(id) || false;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
          onClick={onClose} 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl max-h-[80vh] bg-[#0a0a0f] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
        >
          <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-accent" /> Border Collection
              </h2>
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Select your active identity node</p>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">
            {/* Artifact Collection */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <Award className="w-4 h-4 text-accent" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Event Artifacts</h3>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {SPECIAL_BORDERS.map((border) => {
                  const unlocked = isUnlocked(border.id);
                  const active = user.equippedBorder === border.id;
                  
                  return (
                    <button
                      key={border.id}
                      disabled={!unlocked || isEquipping !== null}
                      onClick={() => handleEquip(border.id)}
                      className={cn(
                        "group relative p-4 rounded-[2rem] border transition-all duration-500 flex flex-col items-center gap-3",
                        active ? "bg-accent/10 border-accent shadow-xl" : "bg-white/[0.02] border-white/5",
                        !unlocked && "opacity-40 grayscale"
                      )}
                    >
                      <AvatarDisplay src={user.photoURL} size="md" borderId={border.id} />
                      <div className="text-center">
                        <p className="text-[9px] font-black text-white uppercase truncate w-full">{border.name}</p>
                        <p className="text-[6px] font-bold text-neutral-600 uppercase">{border.tier}</p>
                      </div>

                      {!unlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-neutral-700" />}
                      {active && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-accent" />}
                      {isEquipping === border.id && <Loader2 className="absolute inset-0 m-auto w-5 h-5 text-accent animate-spin" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Rank Seals */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-neutral-600">
                <Zap className="w-4 h-4" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">System Seals</h3>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {RANK_BORDERS.map((border) => {
                  const unlocked = isUnlocked(border.id);
                  const active = user.equippedBorder === border.id;
                  
                  return (
                    <button
                      key={border.id}
                      disabled={!unlocked || isEquipping !== null}
                      onClick={() => handleEquip(border.id)}
                      className={cn(
                        "p-4 rounded-[2rem] border transition-all duration-500 flex flex-col items-center gap-3 bg-white/[0.02]",
                        active ? "border-accent ring-1 ring-accent" : "border-white/5",
                        !unlocked && "opacity-40 grayscale"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full border-2 border-white/10 flex items-center justify-center bg-black/40">
                         <Award className={cn("w-5 h-5", active ? "text-accent" : "text-neutral-800")} />
                      </div>
                      <p className="text-[9px] font-black text-white uppercase">{border.name}</p>
                      {!unlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-neutral-700" />}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handleEquip('none')}
                  className="p-4 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-red-500/40 transition-all text-neutral-600 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                  <span className="text-[8px] font-black uppercase">None</span>
                </button>
              </div>
            </section>
          </div>
          
          <footer className="p-6 bg-white/[0.02] border-t border-white/5 text-center">
            <p className="text-[7px] font-black text-neutral-700 uppercase tracking-[0.5em]">Identity nodes synchronized with grid</p>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
