
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BadgeDisplay from '@/components/ui/BadgeDisplay';

interface DailyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
}

const DailyLoginModal: React.FC<DailyLoginModalProps> = ({ isOpen, onClose, streak }) => {
  if (!isOpen) {
    return null;
  }

  const getReward = () => {
    // Simple reward logic
    if (streak > 0 && streak % 7 === 0) {
      return `You've earned a new Badge!`;
    }
    return `You've earned 10 bonus points!`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daily Login Reward</DialogTitle>
        </DialogHeader>
        <div className="my-4 text-center">
          <p className="text-lg">Welcome back!</p>
          <p className="text-2xl font-bold">Your login streak is now {streak} days!</p>
          <div className="my-4">
            <p className="font-semibold">{getReward()}</p>
            {streak > 0 && streak % 7 === 0 && (
                <div className='flex justify-center mt-2'>
                    <BadgeDisplay badgeId={`streak-${streak}`} size='lg' />
                </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Claim & Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DailyLoginModal;
