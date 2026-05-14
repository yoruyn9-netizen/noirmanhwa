
"use client";

import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAuthStore } from '@/store/authStore';
import { uploadFile } from '@/lib/firebaseStorage';
import { compressImage, getCroppedImg } from '@/lib/imageUtils';
import { updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  Loader2, 
  X, 
  Check, 
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProfilePictureUploaderProps {
  onClose: () => void;
}

export default function ProfilePictureUploader({ onClose }: ProfilePictureUploaderProps) {
  const { user, updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const imgRef = useRef<HTMLImageElement>(null);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(crop);
  }

  async function handleUpload() {
    if (!user || !completedCrop || !imgRef.current) return;

    setIsProcessing(true);
    try {
      // 1. Get cropped blob
      const croppedBlob = await getCroppedImg(imgSrc, completedCrop);
      
      // 2. Compress the blob
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
      const compressedFile = await compressImage(croppedFile);
      
      // 3. Upload to Firebase
      const path = `profiles/${user.uid}/${Date.now()}.jpg`;
      const downloadURL = await uploadFile(path, compressedFile, (p) => setProgress(p));
      
      // 4. Update Firestore
      await updateUserProfile(user.uid, { photoURL: downloadURL });
      updateUserInStore({ photoURL: downloadURL });
      
      toast({ title: "Avatar Updated", description: "Your new profile picture is active." });
      onClose();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Upload Failed", description: "Something went wrong during the sync." });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <Camera className="w-5 h-5 text-accent" /> Avatar Uplink
          </h2>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Update your visual signature</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </header>

      {!imgSrc ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-black/20 group hover:border-accent/40 transition-all">
          <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <ImageIcon className="w-8 h-8 text-accent/40" />
          </div>
          <label className="cursor-pointer px-10 py-4 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
            SELECT IMAGE
            <input type="file" className="hidden" accept="image/*" onChange={onSelectFile} />
          </label>
          <p className="mt-4 text-[7px] font-black text-neutral-600 uppercase tracking-[0.2em]">MAX 5MB • JPG, PNG, WEBP</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="relative max-h-[400px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-black flex items-center justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} className="max-h-[400px] w-auto" alt="Source" />
            </ReactCrop>
          </div>

          {isUploading && (
            <div className="space-y-3 px-4">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-accent">
                 <span>Transmitting Data</span>
                 <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1 bg-white/5" />
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setImgSrc('')}
              disabled={isUploading}
              className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-3.5 h-3.5" /> CANCEL
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || !completedCrop}
              className="flex-[2] py-4 bg-accent text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              CONFIRM UPLINK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
