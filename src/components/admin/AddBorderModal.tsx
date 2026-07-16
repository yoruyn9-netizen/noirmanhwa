"use client";
import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, PlusCircle } from 'lucide-react';
import { BorderTier } from '@/types/border';

export default function AddBorderModal() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState('');
  const [tier, setTier] = useState<BorderTier>('common');
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canUpload = user?.role === 'admin' || user?.role === 'owner';

  const resetForm = () => {
    setName('');
    setTier('common');
    setFile(null);
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file || !name || !tier || !canUpload) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill all fields and ensure you have upload permissions.',
      });
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file, 'borders');

      await addDoc(collection(db, 'borders'), {
        name,
        imageUrl,
        tier,
        createdAt: serverTimestamp(),
        unlockedBy: [tier], // Automatically unlockable by tier
      });

      toast({
        title: 'Upload Successful',
        description: `Border "${name}" has been added.`,
      });
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'There was an error uploading the border. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (!canUpload) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload New Border
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0a0a0f] border-neutral-800">
        <DialogHeader>
          <DialogTitle>Add New Border</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tier" className="text-right">Tier</Label>
            <Select onValueChange={(value: BorderTier) => setTier(value)} value={tier}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="special">Special</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">Image</Label>
            <Input id="file" type="file" ref={fileRef} onChange={(e) => setFile(e.target.files?.[0] || null)} className="col-span-3" />
          </div>
        </div>
        <Button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Upload Border
        </Button>
      </DialogContent>
    </Dialog>
  );
}