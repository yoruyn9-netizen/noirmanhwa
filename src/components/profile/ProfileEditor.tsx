
"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { uploadProfileImage } from '@/lib/imageUpload';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Save, Loader2, X, Edit3, AlignLeft, Camera, Check 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AvatarDisplay from './AvatarDisplay';
import { Progress } from '@/components/ui/progress';

interface ProfileEditorProps {
  onClose: () => void;
}

export default function ProfileEditor({ onClose }: ProfileEditorProps) {
  const { user, updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File Too Large", description: "Maximum size is 5MB." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadProfileImage(user.uid, file, (p) => setUploadProgress(p));
      await updateUserProfile(user.uid, { photoURL: url });
      updateUserInStore({ photoURL: url });
      toast({ title: "Avatar Synchronized", description: "Visual identity updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Uplink Failed", description: "Could not upload image." });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!user || !name.trim()) return;

    setIsSaving(true);
    try {
      const updateData = { displayName: name, bio: bio };
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
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-10 space-y-10">
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
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <AvatarDisplay src={user?.photoURL} name={user?.displayName} size="xl" borderId={user?.equippedBorder} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent text-white rounded-2xl flex items-center justify-center border-4 border-[#0a0a0f] shadow-xl hover:scale-110 transition-all disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          
          {isUploading && (
            <div className="w-full max-w-[200px] space-y-2">
              <div className="flex justify-between text-[7px] font-black text-accent uppercase tracking-widest">
                <span>Transmitting Data</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1 bg-white/5" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-2"><User className="w-3 h-3" /> Signature</label>
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)} maxLength={30}
              className="w-full bg-[#050508] border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[11px]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-2"><AlignLeft className="w-3 h-3" /> Sub-Routine</label>
            <textarea 
              value={bio} onChange={e => setBio(e.target.value)} maxLength={150} rows={3}
              className="w-full bg-[#050508] border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-medium text-[11px] resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim() || isUploading}
          className="w-full py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-accent hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-3"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-4 h-4" />}
          SAVE IDENTITY NODE
        </button>
      </div>
    </motion.div>
  );
}
