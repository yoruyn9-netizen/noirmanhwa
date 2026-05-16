
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { X, Lock, Check, Sparkles, Loader2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import AvatarDisplay from './AvatarDisplay';

interface BorderGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPECIAL_BORDERS = [
  { id: 'ink-master', name: 'Ink Master', url: 'https://i.ibb.co.com/DgDsKgVh/9b6b3710-d9a6-42ce-9237-0a4655ecd205-20260516-032637-0000.png', type: 'special' },
  { id: 'cyber-core', name: 'Cyber Core', url: 'https://i.ibb.co.com/JR5FhyDW/f0d15853-c7ab-4a2a-a14e-8e0d2ba6c330-20260516-032602-0000.png', type: 'special' },
  { id: 'celestial-dream', name: 'Celestial Dream', url: 'https://i.ibb.co.com/n85NZRVB/c3d098ec-c12d-4ece-b742-adc657357290-20260516-032528-0000.png', type: 'special' },
  { id: 'stellar-compass', name: 'Stellar Compass', url: 'https://i.ibb.co.com/LdzzJtRW/823e8e96-4d93-49dc-be69-36c49b67a1b8-20260516-032451-0000.png', type: 'special' },
];

const RANK_BORDERS = [
  { id: 'bronze-glow', name: 'Bronze Warrior', type: 'rank', color: 'border-orange-700' },
  { id: 'silver-shimmer', name: 'Silver Knight', type: 'rank', color: 'border-slate-400' },
  { id: 'gold-admin', name: 'Golden Sentinel', type: 'rank', color: 'border-yellow-500' },
  { id: 'legend-owner', name: 'Celestial Legend', type: 'rank', color: 'border-purple-500' },
];

export default function BorderGalleryModal({ isOpen, onClose }: BorderGalleryModalProps) {
  const { user, updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  const [isEquipping, setIsEquipping] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleEquip = async (borderId: string) => {
    setIsEquipping(borderId);
    try {
      await updateUserProfile(user.uid, { equippedBorder: borderId });
      updateUserInStore({ equippedBorder: borderId });
      toast({
        title: "Protocol Synced",
        description: `Identity frame updated successfully.`,
      });
      setTimeout(onClose, 400);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Identity relay failed." });
    } finally {
      setIsEquipping(null);
    }
  };

  const isUnlocked = (id: string) => {
    if (user.role === 'owner') return true;
    return user.ownedBorders?.includes(id) || false;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
          onClick={onClose} 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[85vh] bg-[#0a0a0f] border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
        >
          <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-accent" /> Artifact Gallery
              </h2>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Select your visual signature from the grid</p>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
              <X className="w-5 h-5 text-white" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">
            {/* Special Artifacts */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <Award className="w-5 h-5 text-accent" />
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-white">Event Artifacts</h3>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {SPECIAL_BORDERS.map((border) => {
                  const unlocked = isUnlocked(border.id);
                  const active = user.equippedBorder === border.id;
                  
                  return (
                    <div key={border.id} className="group relative">
                      <button
                        disabled={!unlocked || isEquipping !== null}
                        onClick={() => handleEquip(border.id)}
                        className={cn(
                          "w-full p-6 rounded-[2.5rem] border transition-all duration-500 relative flex flex-col items-center gap-4",
                          active ? "bg-accent/10 border-accent shadow-xl shadow-accent/10" : "bg-white/[0.02] border-white/5 hover:border-white/20",
                          !unlocked && "opacity-40 grayscale"
                        )}
                      >
                        <div className="relative">
                          <AvatarDisplay src={user.photoURL} size="lg" borderId={border.id} />
                          {active && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg animate-in zoom-in z-50">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-[10px] font-black text-white uppercase truncate">{border.name}</p>
                          <p className={cn("text-[7px] font-bold uppercase tracking-widest", unlocked ? "text-accent" : "text-neutral-600")}>
                            {unlocked ? 'AUTHENTICATED' : 'LOCKED'}
                          </p>
                        </div>
                        {isEquipping === border.id && (
                          <div className="absolute inset-0 bg-black/60 rounded-[2.5rem] flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-accent animate-spin" />
                          </div>
                        )}
                      </button>
                      {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <Lock className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Default Tier Borders */}
            <section className="space-y-6">
               <div className="flex items-center gap-4 text-neutral-600">
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em]">System Seals</h3>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                 {RANK_BORDERS.map((border) => {
                   const unlocked = isUnlocked(border.id) || border.id === 'bronze-glow'; // Everyone has bronze for demo
                   const active = user.equippedBorder === border.id;
                   
                   return (
                    <button
                      key={border.id}
                      disabled={!unlocked || isEquipping !== null}
                      onClick={() => handleEquip(border.id)}
                      className={cn(
                        "w-full p-6 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center gap-4 bg-white/[0.02]",
                        active ? "border-accent bg-accent/5" : "border-white/5 hover:border-white/20",
                        !unlocked && "opacity-40 grayscale"
                      )}
                    >
                      <div className="relative">
                        <AvatarDisplay src={user.photoURL} size="md" borderId={border.id} />
                        {active && <Check className="absolute -top-1 -right-1 w-5 h-5 text-accent z-50" />}
                      </div>
                      <p className="text-[9px] font-black text-white uppercase">{border.name}</p>
                    </button>
                   );
                 })}
                 <button
                    onClick={() => handleEquip('none')}
                    className="w-full p-6 rounded-[2.5rem] border border-dashed border-white/5 flex flex-col items-center justify-center gap-4 hover:border-red-500/40 transition-all text-neutral-600 hover:text-red-500"
                  >
                    <X className="w-8 h-8" />
                    <span className="text-[9px] font-black uppercase">Purge Frame</span>
                  </button>
              </div>
            </section>
          </div>
          
          <footer className="p-8 bg-white/[0.02] border-t border-white/5 text-center">
            <p className="text-[8px] font-black text-neutral-700 uppercase tracking-[0.4em]">Artifact nodes synchronized with master grid</p>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
