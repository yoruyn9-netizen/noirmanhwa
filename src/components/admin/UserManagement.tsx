
"use client";

import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserProfile } from '@/lib/firestore';
import { UserProfile } from '@/types/user';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { 
  ShieldCheck, ShieldAlert, UserPlus, 
  Search, Loader2, Star, Frame 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BORDERS } from '@/lib/borders';
import AvatarDisplay from '../profile/AvatarDisplay';

export default function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
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
                  <h4 className="text-[11px] font-black uppercase text-white">{u.displayName || 'Unknown'}</h4>
                  <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Promote to Admin */}
                {u.role === 'user' && (
                  <button
                    onClick={() => handleUpdate(u.uid, { role: 'admin' }, "Promoted to Admin")}
                    disabled={processing === u.uid}
                    className="p-3 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                )}

                {/* Border Assignment */}
                <select
                  value={u.equippedBorder || 'none'}
                  onChange={(e) => handleUpdate(u.uid, { equippedBorder: e.target.value }, "Border Assigned")}
                  className="bg-black/40 border border-white/5 text-[8px] font-black text-neutral-400 rounded-lg p-1.5 focus:ring-1 focus:ring-accent outline-none"
                >
                  {BORDERS.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                </select>

                {/* Ban Toggle */}
                <button
                  onClick={() => handleUpdate(u.uid, { isBanned: !u.isBanned }, u.isBanned ? "Node Reinstated" : "Node Terminated")}
                  disabled={processing === u.uid}
                  className={cn(
                    "p-3 rounded-xl transition-all",
                    u.isBanned ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                  )}
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
