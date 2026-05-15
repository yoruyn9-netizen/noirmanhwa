
"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Save, Loader2, X, Edit3, AlignLeft, Camera, Check 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AvatarDisplay from './AvatarDisplay';
import { Progress } from '@/components/ui/progress';
import imageCompression from 'browser-image-compression';

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

    setIsUploading(true);
    setUploadProgress(10); 

    try {
      // 1. Compression Matrix
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      setUploadProgress(30);
      const compressedFile = await imageCompression(file, options);
      
      // 2. Cloudinary Uplink
      setUploadProgress(60);
      const url = await uploadToCloudinary(compressedFile, 'avatars');
      
      // 3. Firestore Sync
      setUploadProgress(90);
      await updateUserProfile(user.uid, { photoURL: url });
      updateUserInStore({ photoURL: url });
      
      toast({ title: "Visual Node Updated", description: "Your identity avatar has been synchronized." });
    } catch (err) {
      toast({ variant: "destructive", title: "Uplink Failure", description: "Cloudinary synchronization failed." });
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
      toast({ title: "Identity Log Saved", description: "System parameters updated successfully." });
      setTimeout(onClose, 500);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Database communication timeout." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 space-y-10 h-full overflow-y-auto hide-scrollbar">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <Edit3 className="w-6 h-6 text-accent" /> Identity Calibration
          </h2>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Adjusting system-wide parameters</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="space-y-12 max-w-xl mx-auto">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <AvatarDisplay src={user?.photoURL} name={user?.displayName} size="xl" borderId={user?.equippedBorder} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center border-4 border-[#020205] shadow-xl hover:scale-110 transition-all disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          
          {isUploading && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[8px] font-black text-accent uppercase tracking-widest">
                <span>Transmitting Data Node</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1 bg-white/5" />
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-2 ml-2">
              <User className="w-3 h-3" /> Public Signature
            </label>
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)} maxLength={30}
              placeholder="ENTER NAME..."
              className="w-full bg-[#0a0a0f] border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[11px] uppercase tracking-widest"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-2 ml-2">
              <AlignLeft className="w-3 h-3" /> Identity Bio
            </label>
            <textarea 
              value={bio} onChange={e => setBio(e.target.value)} maxLength={150} rows={4}
              placeholder="ENTER BIO DATA..."
              className="w-full bg-[#0a0a0f] border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-medium text-[11px] resize-none leading-relaxed"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim() || isUploading}
          className="w-full py-5 bg-white text-black font-black rounded-2xl text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-accent hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-4"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          SAVE IDENTITY NODE
        </button>
      </div>
    </motion.div>
  );
}
