"use client";

import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Camera, Upload, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface BannerEditorProps {
  bannerURL?: string | null;
  displayName?: string | null;
}

export default function BannerEditor({ bannerURL, displayName }: BannerEditorProps) {
  const { user, updateUserInStore } = useAuthStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(bannerURL || null);

  if (!user) return null;

  const handleFileSelect = async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please select an image file.'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Maximum file size is 5MB.'
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 30;
        });
      }, 200);

      const url = await uploadToCloudinary(file, 'banners');
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update Firestore
      await updateUserProfile(user.uid, { bannerURL: url });
      updateUserInStore({ bannerURL: url });

      toast({
        title: 'Banner Uploaded',
        description: 'Your profile banner has been updated successfully.',
        variant: 'default'
      });

      setTimeout(() => {
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Failed to upload banner. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await updateUserProfile(user.uid, { bannerURL: null });
      updateUserInStore({ bannerURL: null });
      setPreview(null);
      toast({
        title: 'Banner Removed',
        description: 'Your profile banner has been removed.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove banner.'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner Display */}
      <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5 group">
        {preview ? (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={preview}
            alt="banner preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-neutral-600" />
            </div>
            <p className="text-[11px] font-black text-neutral-600 uppercase tracking-widest text-center">
              No Banner Uploaded
            </p>
          </div>
        )}

        {/* Upload Button Overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute top-3 right-3 p-2.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 z-10 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploading && uploadProgress > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Uploading...</p>
            <p className="text-[9px] font-black text-accent">{Math.round(uploadProgress)}%</p>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              className="h-full bg-gradient-to-r from-accent to-accent/50"
            />
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
            uploading
              ? "bg-white/10 text-neutral-600 cursor-not-allowed"
              : "bg-accent text-black hover:brightness-110"
          )}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          {preview ? 'Change Banner' : 'Upload Banner'}
        </button>
        {preview && (
          <button
            onClick={handleRemove}
            disabled={uploading}
            className="px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5" />
        <p className="text-[9px] font-medium text-neutral-400 leading-relaxed">
          Maximum file size is 5MB. Supported formats: JPG, PNG, WebP. Image will be automatically compressed and optimized.
        </p>
      </div>
    </div>
  );
}
