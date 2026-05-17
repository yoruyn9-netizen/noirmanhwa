"use client";

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, findUserByEmail } from '@/lib/firestore';
import { X, Star, Loader2 } from 'lucide-react';

interface AddPremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPremiumAdded: () => void;
}

export default function AddPremiumModal({ isOpen, onClose, onPremiumAdded }: AddPremiumModalProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState('30'); // Default to 30 days
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ variant: "destructive", title: "Validation Error", description: "Email or username is required." });
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await findUserByEmail(email);
      if (!user) {
        throw new Error("User not found.");
      }

      const expiryDate = new Date();
      if (duration === 'custom') {
        // Handle custom date logic if a date picker is added
      } else {
        expiryDate.setDate(expiryDate.getDate() + parseInt(duration, 10));
      }

      await updateUserProfile(user.uid, { 
        role: 'premium', 
        premiumExpiry: expiryDate,
        premiumNote: note
      });

      toast({ title: "Success", description: `${user.displayName} has been granted Premium status.` });
      onPremiumAdded();
      onClose();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to grant premium." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 mx-4 bg-gray-900 border border-amber-500/30 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="text-amber-400" />
            Add Premium
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="premium-email" className="block text-sm font-medium text-gray-300 mb-1">
                User Email or Username
              </label>
              <input
                id="premium-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">
                Duration
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="1">1 Day</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                {/* <option value="custom">Custom Date</option> */}
              </select>
            </div>
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-300 mb-1">
                Note (Optional)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for granting premium..."
                className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 flex items-center"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Star className="mr-2" />}
              Confirm & Grant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
