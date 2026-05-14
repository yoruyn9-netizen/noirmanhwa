"use client";

import React from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import PremiumManager from '@/components/owner/PremiumManager';
import BanManager from '@/components/owner/BanManager';
import { Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function UsersAdminPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000">
      <header className="flex items-center justify-between px-4">
        <Link href="/profile" className="p-3 bg-[#0a0a0f] border border-white/5 rounded-2xl hover:bg-neutral-900 transition-all">
          <ArrowLeft className="w-5 h-5 text-neutral-500" />
        </Link>
        <div className="text-center space-y-1">
          <h1 className="text-xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <Users className="w-5 h-5 text-accent" /> Grid Management
          </h1>
          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Sub-Node Permission Controller</p>
        </div>
        <div className="w-11" />
      </header>

      <Tabs defaultValue="premium" className="space-y-10 px-4">
        <div className="flex overflow-x-auto hide-scrollbar pb-2">
          <TabsList className="bg-[#0a0a0f]/60 border border-white/5 p-1.5 rounded-2xl h-auto flex-nowrap min-w-max">
            <TabsTrigger value="premium" className="px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all whitespace-nowrap">
              PREMIUM PROTOCOLS
            </TabsTrigger>
            <TabsTrigger value="ban" className="px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all whitespace-nowrap">
              ACCESS TERMINATION
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="premium" className="animate-in fade-in slide-in-from-bottom-4">
          <PremiumManager />
        </TabsContent>
        <TabsContent value="ban" className="animate-in fade-in slide-in-from-bottom-4">
          <BanManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RequireAuth(UsersAdminPage, { ownerOnly: true });
