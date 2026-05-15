
"use client";

import React, { useState, useRef } from 'react';
import { uploadFile } from '@/lib/firebaseStorage';
import { addCustomBorder } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon, Upload, Loader2, Info, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function BorderManager() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [tier, setTier] = useState('silver');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !name) {
      if (!name) toast({ variant: "destructive", title: "Missing Name", description: "Provide a label for the border node." });
      return;
    }

    setIsUploading(true);
    try {
      const path = `borders/${Date.now()}-${file.name}`;
      const url = await uploadFile(path, file, (p) => setProgress(p));
      await addCustomBorder(name, url, tier, user.uid);
      toast({ title: "Border Node Integrated", description: "Custom frame added to the central repository." });
      setName('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast({ variant: "destructive", title: "Uplink Failed", description: "Could not upload border image." });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="p-8 bg-[#0a0a0f]/60 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <ImageIcon className="w-4 h-4 text-accent" /> Border Fabrication
          </h3>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Create and upload custom avatar frames</p>
        </div>
      </div>

      <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl flex items-start gap-4">
        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[9px] font-black text-accent uppercase tracking-widest">Fabrication Specs:</p>
          <ul className="text-[8px] font-medium text-neutral-500 space-y-1 list-disc ml-3 uppercase tracking-widest">
            <li>512x512px resolution required</li>
            <li>PNG format with transparent center circle</li>
            <li>Max file size: 2MB</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-widest text-accent ml-2">Border Signature</label>
          <input 
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[11px] uppercase tracking-widest"
            placeholder="LEGENDARY VANGUARD / CRIMSON..."
          />
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-widest text-accent ml-2">Tier Protocol</label>
          <select 
            value={tier} onChange={(e) => setTier(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[11px] uppercase tracking-widest outline-none"
          >
            <option value="bronze">BRONZE</option>
            <option value="silver">SILVER</option>
            <option value="gold">GOLD</option>
            <option value="legend">LEGENDARY</option>
            <option value="special">SPECIAL</option>
          </select>
        </div>

        <div className="relative">
          <input type="file" ref={fileRef} className="hidden" accept="image/png" onChange={handleUpload} />
          <button 
            onClick={() => fileRef.current?.click()}
            disabled={isUploading || !name}
            className="w-full py-8 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-accent/40 transition-all group disabled:opacity-20"
          >
            {isUploading ? (
              <div className="w-full max-w-[200px] space-y-4">
                 <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
                 <Progress value={progress} className="h-1 bg-white/5" />
                 <p className="text-[8px] font-black text-center text-accent uppercase tracking-widest">TRANSMITTING IMAGE DATA...</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-neutral-800 group-hover:text-accent transition-colors" />
                <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em]">SELECT SOURCE PNG</p>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
