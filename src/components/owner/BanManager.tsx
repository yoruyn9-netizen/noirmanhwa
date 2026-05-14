
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getAllUsers, updateUserProfile } from '@/lib/firestore';
import { UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function BanManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data.filter(u => u.role !== 'owner')); // Cannot ban owner
    setLoading(false);
  };

  const toggleBan = async (userId: string, current: boolean) => {
    setProcessing(userId);
    try {
      await updateUserProfile(userId, { isBanned: !current });
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isBanned: !current } : u));
      toast({ 
        title: !current ? "NODE BANNED" : "NODE REINSTATED", 
        description: `Access protocol ${!current ? 'TERMINATED' : 'RESTORED'} for user.` 
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Action Failed", description: "Could not modify user access." });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-6 bg-red-600/5 border border-red-600/10 rounded-3xl flex items-center gap-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-tight text-red-500">Access Control Terminal</h3>
          <p className="text-[9px] font-black text-red-900/60 uppercase tracking-widest leading-relaxed">
            Terminating user access will force logout and block all future neural links. Handle with extreme prejudice.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-[9px] font-black uppercase tracking-widest">Parsing Security Grid</span>
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((u) => (
            <div 
              key={u.uid}
              className={cn(
                "p-5 rounded-3xl border transition-all duration-500 flex items-center justify-between",
                u.isBanned ? "bg-red-600/5 border-red-600/20" : "bg-[#0a0a0f] border-white/5"
              )}
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border",
                  u.isBanned ? "bg-red-600/10 border-red-600/20" : "bg-black border-white/5"
                )}>
                   {u.isBanned ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <ShieldCheck className="w-5 h-5 text-neutral-800" />}
                </div>
                <div>
                  <h4 className={cn(
                    "text-[11px] font-black uppercase tracking-tight",
                    u.isBanned ? "text-red-500" : "text-white"
                  )}>
                    {u.displayName || 'Anonymous Node'}
                  </h4>
                  <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{u.email}</p>
                </div>
              </div>

              <button
                onClick={() => toggleBan(u.uid, !!u.isBanned)}
                disabled={processing === u.uid}
                className={cn(
                  "px-8 py-3 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all",
                  u.isBanned 
                    ? "bg-green-600/10 text-green-500 border border-green-600/20 hover:bg-green-600 hover:text-white" 
                    : "bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white"
                )}
              >
                {processing === u.uid ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : u.isBanned ? 'REINSTATE' : 'KICK/BAN'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
