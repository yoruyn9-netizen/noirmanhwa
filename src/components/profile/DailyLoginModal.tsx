"use client";

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { X, CheckCircle, Lock } from 'lucide-react';
import Confetti from 'react-confetti';

interface DailyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
}

export default function DailyLoginModal({ isOpen, onClose, streak }: DailyLoginModalProps) {
    const { user, setUser } = useAuthStore();
    const { toast } = useToast();
    const [isClaiming, setIsClaiming] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const handleClaim = async () => {
        if (!user) return;
        setIsClaiming(true);

        try {
            const today = new Date();
            await updateUserProfile(user.uid, { lastClaimDate: today });
            setUser({ ...user, lastClaimDate: today });

            setShowConfetti(true);
            toast({ title: 'Reward Claimed!', description: 'You have successfully claimed your daily reward.' });

            setTimeout(() => {
                setShowConfetti(false);
                onClose();
            }, 5000); // Confetti for 5 seconds

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to claim reward.' });
            setIsClaiming(false);
        }
    };

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
        <div className="w-full max-w-md p-6 mx-4 bg-gray-900 border-2 border-purple-500 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-white">Daily Reward</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="text-center mb-6">
                <p className="text-lg font-bold text-purple-400">Day {streak} Login Streak</p>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
                {Array.from({ length: 7 }).map((_, i) => {
                    const day = i + 1;
                    const isClaimed = day < streak;
                    const isCurrentDay = day === streak;
                    const isFutureDay = day > streak;

                    return (
                        <div key={day} className={`p-4 rounded-lg border ${isCurrentDay ? 'border-purple-500 scale-110 animate-pulse' : 'border-gray-700'} ${isFutureDay ? 'opacity-50' : ''}`}>
                            <p className="font-bold">Day {day}</p>
                            {isClaimed && <CheckCircle className="w-8 h-8 mx-auto mt-2 text-green-400"/>}
                            {isCurrentDay && <button onClick={handleClaim} disabled={isClaiming} className="mt-2 w-full bg-purple-600 text-white py-2 rounded-lg">CLAIM</button>}
                            {isFutureDay && <Lock className="w-8 h-8 mx-auto mt-2 text-gray-500"/>}
                        </div>
                    );
                })}
            </div>
            <div className="mt-6">
                <button onClick={onClose} className="w-full py-2 bg-gray-700 text-white rounded-lg">Close</button>
            </div>
        </div>
    </div>
  );
}
