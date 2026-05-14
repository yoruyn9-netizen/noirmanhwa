
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Search, 
  User, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { getAllUsers, updateUserProfile } from '@/lib/firestore';
import { UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PremiumManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const togglePremium = async (userId: string, current: boolean) => {
    setProcessing(userId);
    try {
      await updateUserProfile(userId, { isPremium: !current });
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isPremium: !current } : u));
      toast({ title: "Status Updated", description: `Premium protocol ${!current ? 'ENABLED' : 'DISABLED'} for node.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not update user status." });
    } finally {
      setProcessing(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Search Node */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-accent transition-colors" />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter user nodes by signature or uplink..."
          className="w-full bg-[#0a0a0f] border border-white/5 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 text-[11px] font-black uppercase tracking-widest placeholder:text-neutral-800"
        />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-[9px] font-black uppercase tracking-widest">Scanning Grid</span>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredUsers.map((userNode) => (
            <motion.div 
              layout
              key={userNode.uid}
              className="p-5 bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-3xl flex items-center justify-between group hover:border-accent/40 transition-all duration-500"
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-12 h-12 rounded-2xl border flex items-center justify-center overflow-hidden",
                  userNode.isPremium ? "border-yellow-500/50 bg-yellow-500/5" : "border-white/5 bg-black"
                )}>
                  {userNode.photoURL ? (
                    <img src={userNode.photoURL} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <User className="w-5 h-5 text-neutral-800" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[11px] font-black uppercase text-white group-hover:text-accent transition-colors">
                      {userNode.displayName || 'Unknown Node'}
                    </h4>
                    {userNode.isPremium && (
                      <div className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-1.5">
                        <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
                        <span className="text-[7px] font-black text-yellow-500 uppercase tracking-widest">PREMIUM</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{userNode.email}</p>
                </div>
              </div>

              <button
                onClick={() => togglePremium(userNode.uid, !!userNode.isPremium)}
                disabled={processing === userNode.uid}
                className={cn(
                  "px-6 py-3 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] transition-all",
                  userNode.isPremium 
                    ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white" 
                    : "bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white shadow-lg shadow-accent/10"
                )}
              >
                {processing === userNode.uid ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : userNode.isPremium ? 'REMOVE PREMIUM' : 'SET PREMIUM'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
