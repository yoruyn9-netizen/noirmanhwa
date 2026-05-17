"use client";

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, findUserByEmail } from '@/lib/firestore';
import { X, Shield, Loader2 } from 'lucide-react';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAdded: () => void;
}

const PERMISSIONS = [
  { id: 'upload-chapter', label: 'Upload Chapter' },
  { id: 'edit-manga', label: 'Edit Manga' },
  { id: 'moderate-comments', label: 'Moderate Comments' },
  { id: 'delete-content', label: 'Delete Content' },
];

export default function AddAdminModal({ isOpen, onClose, onAdminAdded }: AddAdminModalProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePermissionChange = (permissionId: string) => {
    setPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

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
      
      await updateUserProfile(user.uid, { role: 'admin', permissions });
      
      toast({ title: "Success", description: `${user.displayName} has been promoted to Admin.` });
      onAdminAdded();
      onClose();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to promote user." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 mx-4 bg-gray-900 border border-purple-500/30 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="text-blue-400" />
            Add Admin
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                User Email or Username
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSIONS.map(p => (
                  <label key={p.id} className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-md">
                    <input
                      type="checkbox"
                      checked={permissions.includes(p.id)}
                      onChange={() => handlePermissionChange(p.id)}
                      className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">{p.label}</span>
                  </label>
                ))}
              </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Shield className="mr-2" />}
              Confirm & Promote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
