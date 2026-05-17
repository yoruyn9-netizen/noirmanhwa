
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/user';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera } from "lucide-react";
import imageCompression from 'browser-image-compression';
import { Progress } from '@/components/ui/progress';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose, user }) => {
  const { updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if(user) {
        setDisplayName(user.displayName || '');
        setUsername(user.username || '');
        setBio(user.bio || '');
      }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      setUploadProgress(30);
      const compressedFile = await imageCompression(file, options);
      
      setUploadProgress(60);
      const photoURL = await uploadToCloudinary(compressedFile, 'avatars');
      
      setUploadProgress(90);
      await updateUserProfile(user.uid, { photoURL });
      updateUserInStore({ photoURL });
      
      toast({ title: "Avatar Updated", description: "Your new avatar is now visible." });
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload your avatar." });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim() || !username.trim()) {
        toast({ variant: "destructive", title: "Validation Error", description: "Display Name and Username are required." });
        return;
    };

    setIsSaving(true);
    try {
      const updateData = { displayName, username, bio };
      await updateUserProfile(user.uid, updateData);
      updateUserInStore(updateData);
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      onClose();
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not save your changes." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                    <Avatar className="w-24 h-24">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <Button 
                        size="icon" 
                        variant="outline" 
                        className="absolute bottom-0 right-0 rounded-full group-hover:bg-accent"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                {isUploading && <Progress value={uploadProgress} className="w-full" />}
            </div>

            <div className="space-y-2">
                <label htmlFor="displayName">Display Name</label>
                <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <label htmlFor="username">Username</label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
                <label htmlFor="bio">Bio</label>
                <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} />
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving || isUploading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;
