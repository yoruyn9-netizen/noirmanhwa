
"use client";

import React, { useState, useRef } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import AvatarDisplay from '@/components/profile/AvatarDisplay';
import ProfileEditor from '@/components/profile/ProfileEditor';
import BorderGalleryModal from '@/components/profile/BorderGalleryModal';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { updateUserProfile } from '@/lib/firestore';
import { 
  LogOut, Zap, Globe, ShieldCheck, ArrowRight,
  Edit3, LayoutGrid, Camera, Image as ImageIcon, Loader2,
  Grid
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import imageCompression from 'browser-image-compression';

function ProfilePage() {
  const { user, logout, updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerProgress, setBannerProgress] = useState(0);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
    toast({ title: "Session Terminated", description: "Identity node disconnected." });
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingBanner(true);
    setBannerProgress(10);
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressed = await imageCompression(file, options);
      setBannerProgress(40);
      const url = await uploadToCloudinary(compressed, 'banners');
      setBannerProgress(80);
      await updateUserProfile(user.uid, { bannerURL: url });
      updateUserInStore({ bannerURL: url });
      toast({ title: "Narrative Banner Updated", description: "System display signal refreshed." });
    } catch (err) {
      toast({ variant: "destructive", title: "Uplink Failed", description: "Banner transmission failed." });
    } finally {
      setIsUploadingBanner(false);
      setBannerProgress(0);
    }
  };

  if (!user) return null;

  const roleInfo = user.role === 'owner' 
    ? { label: 'SUPREME OWNER', color: 'bg-yellow-500 shadow-yellow-500/20' }
    : user.role === 'admin'
    ? { label: 'SYSTEM MODERATOR', color: 'bg-purple-600 shadow-purple-500/20' }
    : user.isPremium
    ? { label: 'PREMIUM NODE', color: 'bg-accent shadow-accent/20' }
    : { label: 'VERIFIED USER', color: 'bg-white/10 shadow-none' };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000">
      {/* Banner System */}
      <div className="relative h-48 sm:h-64 w-full rounded-[3rem] overflow-hidden bg-white/[0.02] border border-white/5 group shadow-2xl">
        {user.bannerURL ? (
          <img src={user.bannerURL} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" alt="Banner" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10 grayscale">
            <ImageIcon className="w-16 h-16 text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent opacity-60" />
        
        <button 
          onClick={() => bannerInputRef.current?.click()}
          className="absolute top-6 right-6 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:border-accent"
        >
          {isUploadingBanner ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
        </button>
        <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
        
        {isUploadingBanner && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-md">
             <div className="flex justify-between text-[8px] font-black text-accent uppercase mb-2">
                <span>Transmitting Banner</span>
                <span>{bannerProgress}%</span>
             </div>
             <Progress value={bannerProgress} className="h-0.5 bg-white/5" />
          </div>
        )}
      </div>

      {/* Identity Card */}
      <div className="relative -mt-24 sm:-mt-32 px-6 sm:px-10">
        <div className="p-10 bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-2xl flex flex-col items-center md:flex-row md:items-end gap-10">
          <div className="relative group">
            <AvatarDisplay 
              src={user.photoURL} 
              name={user.displayName} 
              size="huge" 
              borderId={user.equippedBorder}
              className="border-8 border-[#020205]"
            />
            <button 
              onClick={() => setIsGalleryOpen(true)}
              className="absolute -bottom-2 -right-2 p-3 bg-accent text-white rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-[#0a0a0f]"
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-6 pb-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl font-black tracking-tighter uppercase text-glow leading-none">
                  {user.displayName || 'Anonymous'}
                </h1>
                <span className={cn("px-4 py-1 text-black text-[9px] font-black rounded-lg", roleInfo.color)}>
                  {roleInfo.label}
                </span>
              </div>
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.5em] opacity-80">Frequency Verified • Node Active</p>
            </div>
            
            <p className="text-[12px] text-neutral-400 font-medium leading-relaxed max-w-lg opacity-60 italic">
              {user.bio || "No synchronization data detected for this node."}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button 
                onClick={() => setIsEditorOpen(true)} 
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:border-accent transition-all flex items-center gap-3"
              >
                <Edit3 className="w-3.5 h-3.5" /> Identity Specs
              </button>
              
              {(user.role === 'owner' || user.role === 'admin') && (
                <Link 
                  href="/admin"
                  className="px-8 py-3 bg-yellow-500 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl"
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Master Node
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2">
        {[
          { icon: Zap, label: 'ENERGY', val: user.isPremium || user.role === 'owner' ? 'MAX' : '99%' },
          { icon: Globe, label: 'REGION', val: 'Global Matrix' },
          { icon: ShieldCheck, label: 'UPLINK', val: 'SECURE' },
        ].map((stat, i) => (
          <div key={i} className="p-8 bg-[#0a0a0f]/60 border border-white/5 rounded-[3rem] text-center space-y-1 shadow-2xl">
            <stat.icon className="w-5 h-5 text-accent mx-auto mb-2 opacity-40" />
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-white tracking-tighter">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="px-2">
        <button onClick={handleLogout} className="w-full flex items-center justify-between p-8 bg-red-600/5 border border-red-600/10 rounded-[3rem] group hover:bg-red-600 transition-all shadow-xl">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-3xl bg-red-600/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <LogOut className="w-6 h-6 text-red-500 group-hover:text-white" />
            </div>
            <div className="text-left space-y-1">
              <p className="text-[12px] font-black uppercase tracking-widest text-red-500 group-hover:text-white">Terminate Connection</p>
              <p className="text-[8px] text-neutral-600 group-hover:text-white/60 font-black uppercase tracking-widest">Securely end global synchronization</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-800 group-hover:text-white group-hover:translate-x-2 transition-all" />
        </button>
      </div>

      <BorderGalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />

      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent side="bottom" className="h-[85vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[4rem] p-0 overflow-hidden">
          <ProfileEditor onClose={() => setIsEditorOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default RequireAuth(ProfilePage);
