
"use client";

import React, { useState, useEffect } from 'react';
import { BORDERS } from '@/lib/borders';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile, subscribeToCustomBorders } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Lock, Check, Sparkles, Upload, Loader2 } from 'lucide-react';

export default function BorderSelector() {
  const { user, updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [customBorders, setCustomBorders] = useState<any[]>([]);

  useEffect(() => {
    const unsub = subscribeToCustomBorders((data) => setCustomBorders(data));
    return () => unsub();
  }, []);

  if (!user) return null;

  const handleEquip = async (borderId: string) => {
    setLoading(borderId);
    try {
      await updateUserProfile(user.uid, { equippedBorder: borderId });
      updateUserInStore({ equippedBorder: borderId });
      toast({ title: "Visual Node Synchronized", description: "Avatar frame successfully equipped." });
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Could not equip border." });
    } finally {
      setLoading(null);
    }
  };

  const isUnlocked = (border: any) => {
    if (border.id === 'none') return true;
    if (user.role === 'owner') return true;
    if (border.tier === 'gold' && user.role === 'admin') return true;
    if (border.tier === 'silver' && user.isPremium) return true;
    return user.equippedBorder === border.id;
  };

  const allBorders = [...BORDERS, ...customBorders.map(b => ({
    id: `custom-${b.imageUrl}`,
    name: b.name,
    tier: 'special',
    cssClass: '',
    requirement: 'Fabricated Node',
    imageUrl: b.imageUrl
  }))];

  return (
    <div className="space-y-8 p-8 bg-[#0a0a0f]/40 backdrop-blur-3xl rounded-[3rem] border border-white/5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent" /> Avatar Frames
          </h3>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Visual identity personalization</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {allBorders.map((border) => {
          const unlocked = isUnlocked(border);
          const active = user.equippedBorder === border.id || (border.id === 'none' && !user.equippedBorder);
          
          return (
            <button
              key={border.id}
              disabled={!unlocked || loading !== null}
              onClick={() => handleEquip(border.id)}
              className={cn(
                "p-5 rounded-3xl border transition-all relative group overflow-hidden",
                active ? "bg-accent/10 border-accent shadow-xl shadow-accent/10 scale-105" : "bg-black border-white/5 hover:border-accent/40",
                !unlocked && "opacity-40 grayscale"
              )}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 relative flex items-center justify-center">
                  {/* Border Render */}
                  {border.imageUrl ? (
                    <img src={border.imageUrl} className="absolute inset-0 w-full h-full object-contain z-10" alt="" />
                  ) : (
                    <div className={cn("absolute inset-0 rounded-[inherit] border-4", border.cssClass)} style={{ color: border.color }} />
                  )}
                  
                  {/* Avatar Preview */}
                  <div className="w-10 h-10 rounded-full bg-neutral-900 overflow-hidden relative">
                    {user.photoURL ? (
                      <img src={user.photoURL} className="w-full h-full object-cover" />
                    ) : (
                      <div className="bg-accent/20 w-full h-full" />
                    )}
                  </div>
                </div>
                
                <div className="text-center space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-tight truncate w-full">{border.name}</p>
                  <p className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest">{border.requirement}</p>
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
