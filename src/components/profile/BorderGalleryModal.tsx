
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { X, Lock, Check, Sparkles, Loader2, Grid, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BorderGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BorderItem {
  id: string;
  name: string;
  url: string;
  tier: 'common' | 'rare' | 'epic' | 'special';
  description?: string;
}

const BORDERS: BorderItem[] = [
  {
    id: 'simple-black',
    name: 'Simple Black',
    url: 'https://i.ibb.co/6gX0Y7v/simple-black.png',
    tier: 'common',
    description: 'A classic and clean black border.'
  },
  {
    id: 'simple-white',
    name: 'Simple White',
    url: 'https://i.ibb.co/T1q2p8d/simple-white.png',
    tier: 'common',
    description: 'A classic and clean white border.'
  },
  {
    id: 'glowing-embers',
    name: 'Glowing Embers',
    url: 'https://i.ibb.co/BPS4V3W/glowing-embers.png',
    tier: 'rare',
    description: 'A border with a warm, fiery glow.'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    url: 'https://i.ibb.co/yQjQj9G/ocean-breeze.png',
    tier: 'rare',
    description: 'A cool and refreshing oceanic border.'
  },
  {
    id: 'royal-velvet',
    name: 'Royal Velvet',
    url: 'https://i.ibb.co/jL1W3v6/royal-velvet.png',
    tier: 'epic',
    description: 'A luxurious border of deep purple velvet.'
  },
  {
    id: 'glacial-shard',
    name: 'Glacial Shard',
    url: 'https://i.ibb.co/hZ2v2DP/glacial-shard.png',
    tier: 'epic',
    description: 'A sharp, crystalline border of pure ice.'
  },
  {
    id: 'ink-master',
    name: 'Ink Master',
    url: 'https://i.ibb.co.com/DgDsKgVh/9b6b3710-d9a6-42ce-9237-0a4655ecd205-20260516-032637-0000.png',
    tier: 'special',
    description: 'A masterpiece of artistic elegance.'
  },
  {
    id: 'cyber-core',
    name: 'Cyber Core',
    url: 'https://i.ibb.co.com/JR5FhyDW/f0d15853-c7ab-4a2a-a14e-8e0d2ba6c330-20260516-032602-0000.png',
    tier: 'special',
    description: 'Futuristic digital essence.'
  },
];

const tierConfig = {
  common: { color: 'text-gray-400', badge: 'bg-gray-700/50 border-gray-600', name: 'Common' },
  rare: { color: 'text-blue-400', badge: 'bg-blue-700/50 border-blue-600', name: 'Rare' },
  epic: { color: 'text-purple-400', badge: 'bg-purple-700/50 border-purple-600', name: 'Epic' },
  special: { color: 'text-yellow-400', badge: 'bg-yellow-700/50 border-yellow-600', name: 'Special' },
};


export default function BorderGalleryModal({ isOpen, onClose }: BorderGalleryModalProps) {
  const { user, updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedBorder, setSelectedBorder] = useState<BorderItem | null>(null);

  if (!user) return null;

  const isPrivilegedUser = user.role === 'owner' || user.role === 'admin';

  const ownedBorders = user.ownedBorders || [];

  const hasOwnedBorder = (borderId: string) => {
    if (isPrivilegedUser) return true;
    return ownedBorders.includes(borderId);
  }
  const isEquipped = user.equippedBorder === selectedBorder?.id;

  const handleEquip = async () => {
    if (!selectedBorder) return;

    setLoading(selectedBorder.id);
    try {
      const updates: { equippedBorder: string; ownedBorders?: string[] } = {
        equippedBorder: selectedBorder.id,
      };

      // If user is admin and doesn't own the border, add it to their collection.
      if (isPrivilegedUser && !ownedBorders.includes(selectedBorder.id)) {
        updates.ownedBorders = [...ownedBorders, selectedBorder.id];
      }

      await updateUserProfile(user.uid, updates);
      updateUserInStore(updates);
      toast({
        title: "Border Equipped",
        description: `${selectedBorder.name} is now your avatar frame.`,
        variant: "default"
      });
    } catch (err) {
      console.error('Equip error:', err);
      toast({
        variant: "destructive",
        title: "Equipment Failed",
        description: "Could not equip border. Try again."
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-2xl mx-auto bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh]">
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-accent/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Grid className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tighter text-glow">Border Gallery</h2>
                    <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Select your avatar frame</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Preview Section */}
                {selectedBorder && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10"
                  >
                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 mb-4">
                      Preview
                    </p>
                    <div className="flex items-center gap-8">
                      <div className="relative w-24 h-24">
                        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#0a0a0f] border-2 border-white/5">
                          {user.photoURL ? (
                            <img src={user.photoURL} className="w-full h-full object-cover" alt="avatar" />
                          ) : (
                            <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                              <span className="text-[12px] font-black text-accent">
                                {user.displayName?.substring(0, 2).toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <img
                          src={selectedBorder.url}
                          alt="border preview"
                          className="absolute inset-0 w-full h-full object-contain scale-[1.15]"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-base font-black uppercase tracking-tight">{selectedBorder.name}</h3>
                           <p className={cn("text-[9px] font-black uppercase tracking-widest mt-1", tierConfig[selectedBorder.tier].color)}>
                            {tierConfig[selectedBorder.tier].name} Tier
                          </p>
                        </div>
                        {selectedBorder.description && (
                          <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
                            {selectedBorder.description}
                          </p>
                        )}
                        {isEquipped && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-lg border border-accent/20 w-fit">
                            <Check className="w-3 h-3 text-accent" />
                            <span className="text-[9px] font-black text-accent uppercase tracking-widest">Currently Equipped</span>
                          </div>
                        )}
                        {hasOwnedBorder(selectedBorder.id) && !isEquipped && (
                          <button
                            onClick={handleEquip}
                            disabled={loading === selectedBorder.id}
                            className="w-full px-4 py-2.5 bg-accent text-black rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {loading === selectedBorder.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Equipping...
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                Equip Border
                              </>
                            )}
                          </button>
                        )}
                        {!hasOwnedBorder(selectedBorder.id) && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-lg border border-red-500/20 w-fit">
                            <Lock className="w-3 h-3 text-red-500" />
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Locked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Borders Grid */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 mb-3">
                    <Sparkles className="w-3 h-3 inline mr-2 text-accent" />
                    Available Frames ({isPrivilegedUser ? 'All' : ownedBorders.length} Owned)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {BORDERS.map((border) => {
                      const owned = hasOwnedBorder(border.id);
                      const active = selectedBorder?.id === border.id;
                      const equipped = user.equippedBorder === border.id;
                      const tierInfo = tierConfig[border.tier];

                      return (
                        <motion.button
                          key={border.id}
                          onClick={() => setSelectedBorder(border)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "relative p-4 rounded-2xl border transition-all duration-300 group overflow-hidden",
                            active
                              ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
                              : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10",
                            !owned && "opacity-50 grayscale"
                          )}
                        >
                          {/* Tier Badge */}
                          <div className={cn(
                              "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border",
                              tierInfo.badge
                          )}>
                              <span className={tierInfo.color}>{border.tier}</span>
                          </div>

                          {/* Border Preview */}
                          <div className="relative w-full aspect-square mb-3 mt-4">
                            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#0a0a0f] border border-white/10">
                              <div className="text-[10px] font-black text-accent">PREV</div>
                            </div>
                            <img
                              src={border.url}
                              alt={border.name}
                              className="absolute inset-0 w-full h-full object-contain scale-[1.15]"
                            />
                          </div>

                          {/* Border Info */}
                          <div className="text-left space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-tight truncate">
                              {border.name}
                            </p>
                          </div>

                          {/* Status Badges */}
                          {!owned && (
                            <div className="absolute top-2 right-2 bg-red-500/80 rounded-lg p-1.5">
                              <Lock className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {equipped && (
                            <div className="absolute bottom-2 right-2 bg-accent rounded-lg p-1.5">
                              <Check className="w-3 h-3 text-black" />
                            </div>
                          )}
                           {active && owned && !equipped && (
                            <div className="absolute inset-0 bg-accent/20 rounded-2xl flex items-center justify-center border-2 border-accent">
                              <span className="text-[9px] font-black text-white bg-black/50 px-2 py-1 rounded">
                                SELECT
                              </span>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Info */}
                {isPrivilegedUser && (
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-medium text-yellow-600/80">
                      As an <span className="font-bold">{user.role}</span>, all frames are automatically unlocked for you.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
