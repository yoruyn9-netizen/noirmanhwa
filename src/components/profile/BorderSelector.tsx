
"use client";

import React, { useState } from 'react';
import { BORDERS } from '@/lib/borders';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Lock, Check, Sparkles } from 'lucide-react';

export default function BorderSelector() {
  const { user, updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  if (!user) return null;

  const handleEquip = async (borderId: string) => {
    setLoading(borderId);
    try {
      await updateUserProfile(user.uid, { equippedBorder: borderId });
      updateUserInStore({ equippedBorder: borderId });
      toast({ title: "Equipment Updated", description: "Your new avatar border is active." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to equip border." });
    } finally {
      setLoading(null);
    }
  };

  const isUnlocked = (border: any) => {
    if (border.id === 'none') return true;
    if (user.role === 'owner') return true;
    if (border.tier === 'gold' && user.role === 'admin') return true;
    if (border.tier === 'silver' && user.isPremium) return true;
    if (border.tier === 'bronze') return true; // Placeholder for active users
    return user.equippedBorder === border.id; // Manual assignments
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-black uppercase tracking-tighter text-glow flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" /> Avatar Frames
        </h3>
        <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Customize your visual presence</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BORDERS.map((border) => {
          const unlocked = isUnlocked(border);
          const active = user.equippedBorder === border.id || (border.id === 'none' && !user.equippedBorder);
          
          return (
            <button
              key={border.id}
              disabled={!unlocked || loading !== null}
              onClick={() => handleEquip(border.id)}
              className={cn(
                "p-4 rounded-3xl border transition-all relative group overflow-hidden",
                active ? "bg-accent/10 border-accent shadow-lg shadow-accent/10" : "bg-[#0a0a0f] border-white/5 hover:border-white/20",
                !unlocked && "opacity-50 grayscale cursor-not-allowed"
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center relative",
                  border.cssClass
                )} style={{ color: border.color }}>
                   <div className="w-8 h-8 rounded-full bg-neutral-900 overflow-hidden">
                     {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <div className="bg-accent/20 w-full h-full" />}
                   </div>
                </div>
                
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-tight truncate w-full">{border.name}</p>
                  <p className="text-[6px] font-bold text-neutral-600 uppercase tracking-widest">{border.requirement}</p>
                </div>
              </div>

              {!unlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-neutral-700" />}
              {active && <Check className="absolute top-2 right-2 w-3 h-3 text-accent" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
