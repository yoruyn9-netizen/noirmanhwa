"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { initializeFirebase } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Lock, Check, Sparkles, Loader2 } from 'lucide-react';

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
  
  // Static Initial Borders
  const [borders, setBorders] = useState<BorderNode[]>([
    { id: 'ink-master', name: 'Ink Master', url: 'https://files.catbox.moe/11w4o6.jpg', tier: 'owner' },
    { id: 'cyber-core', name: 'Cyber Core', url: 'https://files.catbox.moe/547ajf.jpg', tier: 'premium' },
    { id: 'celestial-dream', name: 'Celestial Dream', url: 'https://files.catbox.moe/i37jwr.jpg', tier: 'event' },
    { id: 'stellar-compass', name: 'Stellar Compass', url: 'https://files.catbox.moe/celsgv.jpg', tier: 'premium' }
  ]);

  useEffect(() => {
    // Sync dynamic borders from Firestore
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
      toast({ title: "Identity Updated", description: "Border successfully equipped." });
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Error", description: "Failed to save border." });
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-tighter text-glow flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Avatar Frames
          </h3>
          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Visual Identity Protocols</p>
        </div>
        <button 
          onClick={() => handleEquip('none')}
          className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase hover:bg-red-500/10 transition-colors"
        >
          Remove Frame
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {borders.map((border) => {
          const unlocked = isUnlocked(border);
          const active = user.equippedBorder === border.id;
          
          return (
            <button
              key={border.id}
              disabled={!unlocked || loading !== null}
              onClick={() => handleEquip(border.id)}
              className={cn(
                "p-4 rounded-[2rem] border transition-all relative group overflow-hidden bg-black/40",
                active ? "border-accent ring-1 ring-accent/20" : "border-white/5 hover:border-white/10",
                !unlocked && "opacity-40 grayscale"
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 relative flex items-center justify-center overflow-hidden rounded-full">
                  <img src={border.url} className="absolute inset-0 w-full h-full object-contain z-20 scale-[1.2]" alt="" />
                  <div className="w-10 h-10 rounded-full bg-neutral-900 overflow-hidden relative z-10">
                    {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <div className="bg-accent/20 w-full h-full" />}
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-tight truncate w-full">{border.name}</p>
                  <p className="text-[6px] font-bold text-neutral-600 uppercase tracking-widest">{border.tier} Tier</p>
                </div>
              </div>

              {!unlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-neutral-700" />}
              {active && <Check className="absolute top-2 right-2 w-4 h-4 text-accent" />}
              
              {loading === border.id && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
