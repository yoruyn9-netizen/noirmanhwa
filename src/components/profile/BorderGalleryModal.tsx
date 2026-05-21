"use client";
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { getBorders, equipBorder } from '@/lib/firestore';
import { Border } from '@/types/border';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Lock } from 'lucide-react';
import Image from 'next/image';
import AddBorderModal from '../admin/AddBorderModal';

interface BorderGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BorderGalleryModal({ isOpen, onClose }: BorderGalleryModalProps) {
  const { user, profile, setProfile } = useAuthStore();
  const { toast } = useToast();
  const [borders, setBorders] = useState<Border[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEquipping, setIsEquipping] = useState<string | null>(null);

  const canUpload = user?.role === 'admin' || user?.role === 'owner';

  useEffect(() => {
    if (isOpen) {
      const fetchBorders = async () => {
        setIsLoading(true);
        try {
          const fetchedBorders = await getBorders();
          setBorders(fetchedBorders);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to load borders.' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchBorders();
    }
  }, [isOpen, toast]);

  const handleEquip = async (borderId: string) => {
    if (!user) return;
    setIsEquipping(borderId);
    try {
      await equipBorder(user.uid, borderId);
      if (profile) {
        setProfile({ ...profile, equippedBorder: borderId });
      }
      toast({ title: 'Success', description: 'Border equipped!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to equip border.' });
    } finally {
      setIsEquipping(null);
    }
  };

  const isUnlocked = (border: Border) => {
    if (!user || !profile) return false;
    if (user.role === 'owner' || user.role === 'admin') return true;
    // Check against `unlockedBy` which can contain roles or UIDs
    return border.unlockedBy.includes(user.role) || border.unlockedBy.includes(user.uid);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0a0a0f] border-neutral-800">
        <DialogHeader>
          <DialogTitle>Border Gallery</DialogTitle>
          {canUpload && <AddBorderModal />}
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
            {borders.map((border) => (
              <div key={border.id} className="relative group border border-neutral-700 rounded-lg p-2 flex flex-col items-center justify-center space-y-2 bg-neutral-900/50">
                <div className="relative w-24 h-24">
                  <Image src={border.imageUrl} alt={border.name} layout="fill" objectFit="contain" />
                </div>
                <h3 className="text-sm font-semibold truncate">{border.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${border.tier === 'epic' ? 'bg-purple-500/20 text-purple-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {border.tier}
                </span>
                {isUnlocked(border) ? (
                  <Button 
                    size="sm" 
                    className="w-full"
                    disabled={isEquipping === border.id || profile?.equippedBorder === border.id}
                    onClick={() => handleEquip(border.id)}
                  >
                    {profile?.equippedBorder === border.id ? (
                      <><CheckCircle className="mr-2 h-4 w-4" /> Equipped</>
                    ) : isEquipping === border.id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Equipping</>
                    ) : (
                      'Equip'
                    )}
                  </Button>
                ) : (
                  <Button size="sm" className="w-full" disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    Locked
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
