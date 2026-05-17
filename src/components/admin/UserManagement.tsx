"use client";

import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserProfile } from '@/lib/firestore';
import { UserProfile } from '@/types/user';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { 
  ShieldCheck, ShieldAlert, UserPlus, 
  Search, Loader2, Star, Frame, Shield, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BORDERS } from '@/lib/borders';
import AvatarDisplay from '../profile/AvatarDisplay';
import AddAdminModal from './AddAdminModal';
import AddPremiumModal from './AddPremiumModal';

export default function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isAddPremiumOpen, setIsAddPremiumOpen] = useState(false);

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (uid: string, data: Partial<UserProfile>, msg: string) => {
    setProcessing(uid);
    try {
      await updateUserProfile(uid, data);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...data } : u));
      toast({ title: "Node Updated", description: msg });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update sub-node." });
    } finally {
      setProcessing(null);
    }
  };

  const filtered = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!currentUser || !(currentUser.role === 'owner' || currentUser.role === 'admin')) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="relative group flex-1 min-w-[250px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Scan grid signatures..."
              className="w-full bg-[#0a0a0f] border border-white/5 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 text-[11px] font-black uppercase tracking-widest"
            />
        </div>
        <div className="flex gap-4">
            {currentUser.role === 'owner' && (
                <button onClick={() => setIsAddAdminOpen(true)} className="h-10 px-4 flex items-center gap-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20">
                    <Shield size={16} />
                    Add Admin
                </button>
            )}
            {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
                <button onClick={() => setIsAddPremiumOpen(true)} className="h-10 px-4 flex items-center gap-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20">
                    <Star size={16} />
                    Add Premium
                </button>
            )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center opacity-40">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((u) => (
            <div key={u.uid} className="p-5 bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-3xl flex items-center justify-between group hover:border-accent/40 transition-all duration-500">
              <div className="flex items-center gap-5">
                <AvatarDisplay src={u.photoURL} name={u.displayName} size="md" borderId={u.equippedBorder} />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                    {u.displayName || 'Unknown'}
                    {u.role === 'owner' && <Crown size={16} className="text-red-400"/>}
                    {u.role === 'admin' && <Shield size={16} className="text-blue-400"/>}
                    {u.role === 'premium' && <Star size={16} className="text-amber-400"/>}
                  </h4>
                  <p className="text-[10px] font-mono text-neutral-500 tracking-widest">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 {/* Ban Toggle */}
                <button
                  onClick={() => handleUpdate(u.uid, { isBanned: !u.isBanned }, u.isBanned ? "Node Reinstated" : "Node Terminated")}
                  disabled={processing === u.uid || currentUser.uid === u.uid}
                  className={cn(
                    "p-3 rounded-xl transition-all",
                    u.isBanned ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white",
                    currentUser.uid === u.uid && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AddAdminModal isOpen={isAddAdminOpen} onClose={() => setIsAddAdminOpen(false)} onAdminAdded={fetchUsers} />
      <AddPremiumModal isOpen={isAddPremiumOpen} onClose={() => setIsAddPremiumOpen(false)} onPremiumAdded={fetchUsers} />

    </div>
  );
}
