
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
  onClose?: () => void;
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
      // Image Optimization
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      setUploadProgress(30);
      const compressedFile = await imageCompression(file, options);
      
      // Cloudinary Upload
      setUploadProgress(60);
      const url = await uploadToCloudinary(compressedFile, 'avatars');
      
      // Firestore Update
      setUploadProgress(90);
      await updateUserProfile(user.uid, { photoURL: url });
      updateUserInStore({ photoURL: url });
      
      toast({ title: "Avatar Updated", description: "Your profile picture has been changed successfully." });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Error", description: "Failed to upload your avatar." });
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
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      if (onClose) setTimeout(onClose, 500);
    } catch (err) {
      toast({ variant: "destructive", title: "Save Error", description: "Could not update your profile info." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-10 space-y-10 h-full overflow-y-auto hide-scrollbar">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <Edit3 className="w-6 h-6 text-accent" /> Edit Profile
          </h2>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Update your profile information</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </header>

      <div className="max-w-xl mx-auto space-y-10">
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <AvatarDisplay src={user?.photoURL} name={user?.displayName} size="xl" borderId={user?.equippedBorder} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center border-4 border-[#020205] shadow-xl hover:scale-110 transition-all disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          
          {isUploading && (
            <div className="w-full max-w-[200px] space-y-2">
              <div className="flex justify-between text-[7px] font-black text-accent uppercase tracking-widest">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1 bg-white/5" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-2 ml-1">
              <User className="w-3 h-3" /> Display Name
            </label>
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)} maxLength={30}
              className="w-full bg-[#0a0a0f] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[11px] uppercase"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-accent flex items-center gap-2 ml-1">
              <AlignLeft className="w-3 h-3" /> Biography
            </label>
            <textarea 
              value={bio} onChange={e => setBio(e.target.value)} maxLength={150} rows={3}
              className="w-full bg-[#0a0a0f] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-medium text-[11px] resize-none"
              placeholder="Tell us about yourself"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || isUploading}
            className="w-full py-4 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-accent hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-3"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
