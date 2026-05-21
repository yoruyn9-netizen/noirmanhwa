"use client";

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db, updateUserProfile } from '@/lib/firestore';
import { X, Shield, Loader2, UserPlus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { UserProfile } from '@/types/user';
import { cn } from '@/lib/utils';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAdded: () => void;
}

// Permissions can be defined here or fetched from a config
const PERMISSIONS = [
  { id: 'manage_manga', label: 'Manage Manga' },
  { id: 'manage_users', label: 'Manage Users' },
  { id: 'moderate_chat', label: 'Moderate Chat' },
  { id: 'view_reports', label: 'View Reports' },
];

// Helper function to find a user by email
const findUserByEmail = async (email: string): Promise<UserProfile | null> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where("email", "==", email), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }
  
  const userDoc = querySnapshot.docs[0];
  return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
};


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
      toast({ variant: "destructive", title: "Validation Error", description: "User email is required." });
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await findUserByEmail(email);
      if (!user) {
        throw new Error("User not found with that email.");
      }
      
      // Prevent promoting owner or existing admin
      if (user.role === 'owner' || user.role === 'admin') {
        throw new Error(`${user.displayName} is already a privileged user.`);
      }

      await updateUserProfile(user.uid, { role: 'admin', permissions });
      
      toast({ title: "Success", description: `${user.displayName} has been promoted to Admin.` });
      onAdminAdded();
      onClose();
      setEmail('');
      setPermissions([]);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Promotion Failed", description: error.message || "Failed to promote user." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative w-full max-w-lg bg-[#101015]/80 backdrop-blur-2xl border border-red-500/30 rounded-3xl shadow-2xl"
                >
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                  <UserPlus className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                  <h2 className="text-lg font-black uppercase tracking-tighter text-glow">Promote Operator</h2>
                                  <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Grant admin privileges to a user</p>
                                </div>
                              </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-neutral-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">
                                    User Email
                                </label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter user's registered email"
                                    className="w-full h-12 px-4 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-accent transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">
                                    Admin Permissions
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {PERMISSIONS.map(p => (
                                        <label 
                                            key={p.id} 
                                            className={cn(
                                                "flex items-center gap-3 p-3 bg-white/5 border border-transparent rounded-xl cursor-pointer transition-all",
                                                permissions.includes(p.id) && "border-accent/50 bg-accent/10"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 flex-shrink-0 rounded-md flex items-center justify-center border-2 transition-all",
                                                permissions.includes(p.id) ? "bg-accent border-accent" : "border-white/20"
                                            )}>
                                               {permissions.includes(p.id) && <Check className="w-3 h-3 text-black" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={permissions.includes(p.id)}
                                                onChange={() => handlePermissionChange(p.id)}
                                                className="sr-only"
                                            />
                                            <span className="text-sm text-neutral-300 font-medium">{p.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-white/10">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !email}
                                    className="w-full py-4 text-sm font-black uppercase tracking-widest text-white bg-red-600 rounded-xl hover:bg-red-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            PROMOTING...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-5 h-5" />
                                            Confirm & Promote
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
  );
}

// A dummy Input component to avoid breaking the code, as it's not defined in the context.
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />;
