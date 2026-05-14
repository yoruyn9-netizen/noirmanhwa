
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Save, 
  Loader2, 
  X,
  Sparkles,
  Edit3,
  AlignLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileEditorProps {
  onClose: () => void;
}

export default function ProfileEditor({ onClose }: ProfileEditorProps) {
  const { user, updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !name.trim()) return;

    setIsSaving(true);
    try {
      const updateData = {
        displayName: name,
        bio: bio
      };
      
      await updateUserProfile(user.uid, updateData);
      updateUserInStore(updateData);
      
      toast({ title: "Node Updated", description: "Identity data synchronized successfully." });
      setTimeout(onClose, 500);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Could not update user node." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-10 space-y-10"
    >
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <Edit3 className="w-5 h-5 text-accent" /> Recalibration
          </h2>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Adjusting identity parameters</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[2.5rem] border-2 border-accent/20 p-1 group-hover:border-accent transition-all duration-700">
               <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-[#0a0a0f] flex items-center justify-center">
                 {user?.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                 ) : (
                    <User className="w-10 h-10 text-neutral-800" />
                 )}
               </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent text-white rounded-xl flex items-center justify-center border-4 border-[#0a0a0f] shadow-xl">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>
          <span className="text-[7px] font-black text-neutral-600 uppercase tracking-[0.3em]">Synched via Provider</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <User className="w-3 h-3" /> Signature (Name)
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              className="w-full bg-[#050508] border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[11px]"
              placeholder="System identity..."
            />
            <div className="flex justify-end">
              <span className="text-[7px] font-black text-neutral-800 uppercase">{name.length}/30</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <AlignLeft className="w-3 h-3" /> Sub-Routine (Bio)
            </label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              rows={4}
              className="w-full bg-[#050508] border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-medium text-[11px] resize-none"
              placeholder="Identity data details..."
            />
            <div className="flex justify-end">
              <span className="text-[7px] font-black text-neutral-800 uppercase">{bio.length}/150</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          className="w-full py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-accent hover:text-white transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-20"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
          SAVE IDENTITY NODE
        </button>
      </div>
    </motion.div>
  );
}
