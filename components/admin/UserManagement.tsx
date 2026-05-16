
"use client";

import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserProfile } from '@/lib/firestore';
import { UserProfile } from '@/types/user';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { 
  ShieldCheck, ShieldAlert, UserPlus, 
  Search, Loader2, Star, Frame, Zap, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AvatarDisplay from '../profile/AvatarDisplay';
import ThreeBodyLoader from '../ui/ThreeBodyLoader';
import UserProfileModal from '@/components/UserProfileModal';

export default function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const data = await getAllUsers();
      setUsers(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleUpdate = async (uid: string, data: any, msg: string) => {
    setProcessing(uid);
    try {
      await updateUserProfile(uid, data);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...data } : u));
      toast({ title: "Node Updated", description: msg });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Uplink restricted." });
    } finally {
      setProcessing(null);
    }
  };

  const filtered = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!currentUser || currentUser.role !== 'owner') return null;

  return (
    <div className="space-y-8">
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-accent transition-colors" />
        <input 
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Scan grid signatures..."
          className="w-full bg-[#0a0a0f] border border-white/5 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 text-[11px] font-black uppercase tracking-widest"
        />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <ThreeBodyLoader />
          <span className="text-[9px] font-black uppercase tracking-widest text-accent mt-4">Parsing User Grid</span>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((u) => (
            <div
              key={u.uid}
              onClick={() => setSelectedUserId(u.uid)}
              className="cursor-pointer p-5 bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-3xl flex items-center justify-between group hover:border-accent/40 transition-all duration-500 shadow-xl"
            >
              <div className="flex items-center gap-5">
                <AvatarDisplay src={u.photoURL} name={u.displayName} size="md" borderId={u.equippedBorder} />
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[11px] font-black uppercase text-white">{u.displayName || 'Anonymous'}</h4>
                    {u.role === 'admin' && <Crown className="w-3 h-3 text-purple-500" />}
                    {u.isPremium && <Zap className="w-3 h-3 text-pink-500" />}
                  </div>
                  <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Role Toggle */}
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleUpdate(u.uid, { role: u.role === 'admin' ? 'user' : 'admin' }, "Role Updated");
                  }}
                  disabled={processing === u.uid}
                  className={cn(
                    "p-3 rounded-xl transition-all border",
                    u.role === 'admin' ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/5 text-neutral-500 hover:text-white"
                  )}
                  title="Toggle Admin"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>

                {/* Premium Toggle */}
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleUpdate(u.uid, { isPremium: !u.isPremium }, "Premium Status Updated");
                  }}
                  disabled={processing === u.uid}
                  className={cn(
                    "p-3 rounded-xl transition-all border",
                    u.isPremium ? "bg-pink-500/10 border-pink-500/30 text-pink-400" : "bg-white/5 border-white/5 text-neutral-500 hover:text-white"
                  )}
                  title="Toggle Premium"
                >
                  <Zap className="w-4 h-4" />
                </button>

                {/* Ban Toggle */}
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleUpdate(u.uid, { isBanned: !u.isBanned }, u.isBanned ? "Node Reinstated" : "Node Terminated");
                  }}
                  disabled={processing === u.uid}
                  className={cn(
                    "p-3 rounded-xl transition-all border",
                    u.isBanned ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white"
                  )}
                  title="Terminate Node"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UserProfileModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}
