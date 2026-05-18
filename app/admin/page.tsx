
"use client";

import React from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import { 
  Users, 
  Bell, 
  ImageIcon, 
  AlertTriangle, 
  ArrowLeft,
  LayoutGrid,
  Zap,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from '@/components/admin/UserManagement';
import NotificationManager from '@/components/admin/NotificationManager';
import BorderManager from '@/components/admin/BorderManager';
import ReportDashboard from '@/components/owner/ReportDashboard';
import MangaManagement from '@/components/admin/MangaManagement';

function AdminDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000 px-4">
      <header className="flex items-center justify-between pt-6">
        <Link href="/profile" className="p-3 bg-[#0a0a0f] border border-white/5 rounded-2xl hover:bg-neutral-900 transition-all group">
          <ArrowLeft className="w-5 h-5 text-neutral-500 group-hover:text-white" />
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-yellow-500" /> Supreme Command
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em]">Master Node Terminal v2.5</p>
        </div>
        <div className="w-11" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Nodes', val: 'Connected', icon: Zap },
          { label: 'System Role', val: user?.role.toUpperCase(), icon: ShieldCheck },
          { label: 'Matrix Status', val: 'Online', icon: LayoutGrid },
          { label: 'Authorization', val: 'Supreme', icon: ShieldCheck },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-[#0a0a0f]/60 border border-white/5 rounded-3xl text-center space-y-1">
            <stat.icon className="w-4 h-4 text-accent mx-auto mb-2 opacity-40" />
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{stat.label}</p>
            <p className="text-lg font-black text-white">{stat.val}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-10">
        <div className="flex justify-center">
          <TabsList className="bg-[#0a0a0f]/60 border border-white/5 p-1.5 rounded-[2rem] h-auto flex-wrap justify-center gap-1">
            <TabsTrigger value="users" className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black transition-all">
              <Users className="w-4 h-4 mr-2" /> User Grid
            </TabsTrigger>
            <TabsTrigger value="manga" className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">
              <BookOpen className="w-4 h-4 mr-2" /> Manga
            </TabsTrigger>
            <TabsTrigger value="borders" className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">
              <ImageIcon className="w-4 h-4 mr-2" /> Fabrication
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              <Bell className="w-4 h-4 mr-2" /> Broadcast
            </TabsTrigger>
            <TabsTrigger value="reports" className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all">
              <AlertTriangle className="w-4 h-4 mr-2" /> Anomalies
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-4"><UserManagement /></TabsContent>
        <TabsContent value="manga" className="animate-in fade-in slide-in-from-bottom-4"><MangaManagement /></TabsContent>
        <TabsContent value="borders" className="animate-in fade-in slide-in-from-bottom-4"><BorderManager /></TabsContent>
        <TabsContent value="broadcast" className="animate-in fade-in slide-in-from-bottom-4"><NotificationManager /></TabsContent>
        <TabsContent value="reports" className="animate-in fade-in slide-in-from-bottom-4"><ReportDashboard /></TabsContent>
      </Tabs>
    </div>
  );
}

export default RequireAuth(AdminDashboard, { ownerOnly: true });
