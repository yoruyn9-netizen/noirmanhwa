
"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { initializeFirebase } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Lock, Check, Sparkles, Loader2, X } from 'lucide-react';

const { db } = initializeFirebase();

interface BorderNode {
  id: string;
  name: string;
  url: string;
  tier: string;
}

export default function BorderSelector() {
  const { user, updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [borders, setBorders] = useState<BorderNode[]>([
    { id: 'ink-master', name: 'Ink Master', url: 'https://files.catbox.moe/11w4o6.jpg', tier: 'owner' },
    { id: 'cyber-core', name: 'Cyber Core', url: 'https://files.catbox.moe/547ajf.jpg', tier: 'premium' },
    { id: 'celestial-dream', name: 'Celestial Dream', url: 'https://files.catbox.moe/i37jwr.jpg', tier: 'event' },
    { id: 'stellar-compass', name: 'Stellar Compass', url: 'https://files.catbox.moe/celsgv.jpg', tier: 'premium' }
  ]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'borders'), (snap) => {
      const customBorders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BorderNode));
      setBorders(prev => {
        const unique = [...prev];
        customBorders.forEach(cb => {
          if (!unique.find(u => u.id === cb.id)) unique.push(cb);
        });
        return unique;
      });
    });
    return () => unsub();
  }, []);

  if (!user) return null;

  const handleEquip = async (borderId: string) => {
    setLoading(borderId);
    try {
      await updateUserProfile(user.uid, { equippedBorder: borderId });
      updateUserInStore({ equippedBorder: borderId });
      toast({ title: "Signal Synced", description: `Border Node ${borderId} successfully equipped.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Failed to persist border to Firestore." });
    } finally {
      setLoading(null);
    }
  };

  const isUnlocked = (border: BorderNode) => {
    if (user.role === 'owner') return true;
    if (border.tier === 'admin' && user.role === 'admin') return true;
    if (border.tier === 'premium' && user.isPremium) return true;
    if (border.tier === 'event' || border.tier === 'user') return true;
    return user.equippedBorder === border.id;
  };

  return (
    <div className="p-8 bg-[#0a0a0f]/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 space-y-8 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent" /> Avatar Frames
          </h3>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Personalize your system signature</p>
        </div>
        <button 
          onClick={() => handleEquip('none')}
          className="px-4 py-2 bg-white/5 rounded-xl text-[8px] font-black uppercase hover:bg-red-500/10 transition-colors"
        >
          Remove Frame
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {borders.map((border) => {
          const unlocked = isUnlocked(border);
          const active = user.equippedBorder === border.id;
          
          return (
            <button
              key={border.id}
              disabled={!unlocked || loading !== null}
              onClick={() => handleEquip(border.id)}
              className={cn(
                "p-5 rounded-3xl border transition-all relative group overflow-hidden",
                active ? "bg-accent/10 border-accent shadow-xl shadow-accent/10" : "bg-black/40 border-white/5 hover:border-accent/40",
                !unlocked && "opacity-40 grayscale"
              )}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 relative flex items-center justify-center overflow-hidden rounded-full">
                  {/* Border Render */}
                  <img 
                    src={border.url} 
                    className="absolute inset-0 w-full h-full object-contain z-20 scale-[1.2]" 
                    alt="" 
                  />
                  {/* Avatar Preview */}
                  <div className="w-10 h-10 rounded-full bg-neutral-900 overflow-hidden relative z-10">
                    {user.photoURL ? (
                      <img src={user.photoURL} className="w-full h-full object-cover" />
                    ) : (
                      <div className="bg-accent/20 w-full h-full" />
                    )}
                  </div>
                </div>
                
                <div className="text-center space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-tight truncate w-full">{border.name}</p>
                  <p className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest">{border.tier.toUpperCase()} TIER</p>
                </div>
              </div>

              {!unlocked && <Lock className="absolute top-3 right-3 w-3 h-3 text-neutral-700" />}
              {active && <Check className="absolute top-3 right-3 w-4 h-4 text-accent animate-in zoom-in" />}
              
              {loading === border.id && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
