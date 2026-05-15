
"use client";

import React, { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import AvatarDisplay from '@/components/profile/AvatarDisplay';
import ProfileEditor from '@/components/profile/ProfileEditor';
import BorderSelector from '@/components/profile/BorderSelector';
import UserManagement from '@/components/admin/UserManagement';
import ReportDashboard from '@/components/owner/ReportDashboard';
import NotificationManager from '@/components/admin/NotificationManager';
import BorderManager from '@/components/admin/BorderManager';
import { 
  LogOut, Zap, Globe, ShieldCheck, ArrowRight,
  Edit3, Users, LayoutGrid, Bell, AlertTriangle, Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast({ title: "Session Terminated", description: "Identity node disconnected." });
  };

  if (!user) return null;

  const isOwner = user.role === 'owner';

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000">
      {/* Profile Card */}
      <div className="relative p-10 bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col items-center md:flex-row md:items-start gap-10">
          <AvatarDisplay 
            src={user.photoURL} 
            name={user.displayName} 
            size="xl" 
            borderId={user.equippedBorder}
          />
          
          <div className="flex-1 text-center md:text-left space-y-5">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl font-black tracking-tighter uppercase text-glow leading-none">
                  {user.displayName || 'Anonymous User'}
                </h1>
                {isOwner ? (
                  <span className="px-4 py-1 bg-yellow-500 text-black text-[9px] font-black rounded-lg shadow-xl shadow-yellow-500/20">OWNER</span>
                ) : user.isPremium && (
                  <span className="px-4 py-1 bg-accent text-white text-[9px] font-black rounded-lg">PREMIUM</span>
                )}
              </div>
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.5em] opacity-80">Security Protocol: Verified</p>
            </div>
            
            <p className="text-[12px] text-neutral-400 font-medium leading-relaxed max-w-lg opacity-60 italic">
              {user.bio || "No data entry detected for this synchronization node."}
            </p>
            
            <button onClick={() => setIsEditorOpen(true)} className="px-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-accent/40 transition-all flex items-center gap-3 mx-auto md:mx-0">
              <Edit3 className="w-3.5 h-3.5 text-accent" /> Recalibrate Identity
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2">
        {[
          { icon: Zap, label: 'ENERGY', val: user.isPremium || isOwner ? 'MAX' : '99%' },
          { icon: Globe, label: 'REGION', val: 'Global Matrix' },
          { icon: ShieldCheck, label: 'STATUS', val: user.role.toUpperCase() },
        ].map((stat, i) => (
          <div key={i} className="p-8 bg-[#0a0a0f]/60 border border-white/5 rounded-[2.5rem] text-center space-y-1 shadow-2xl">
            <stat.icon className="w-5 h-5 text-accent mx-auto mb-2 opacity-40" />
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-white tracking-tighter">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Admin Central Console */}
      {isOwner && (
        <section className="space-y-8 px-2">
          <div className="flex items-center gap-4 px-6 py-2 bg-yellow-500/5 border-l-4 border-yellow-500 rounded-r-xl w-fit">
             <LayoutGrid className="w-4 h-4 text-yellow-500" />
             <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-yellow-500">System Command Terminal</h3>
          </div>

          <Tabs defaultValue="users" className="space-y-8">
            <TabsList className="bg-[#0a0a0f]/60 border border-white/5 p-1.5 rounded-3xl h-auto w-full md:w-fit flex overflow-x-auto hide-scrollbar">
              <TabsTrigger value="users" className="flex-1 md:px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-black">
                <Users className="w-3.5 h-3.5 mr-2" /> Users
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex-1 md:px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-accent data-[state=active]:text-white">
                <Bell className="w-3.5 h-3.5 mr-2" /> Broadcasts
              </TabsTrigger>
              <TabsTrigger value="borders" className="flex-1 md:px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <ImageIcon className="w-3.5 h-3.5 mr-2" /> Borders
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex-1 md:px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-red-600 data-[state=active]:text-white">
                <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Anomalies
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <UserManagement />
            </TabsContent>
            <TabsContent value="notifications" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <NotificationManager />
            </TabsContent>
            <TabsContent value="borders" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <BorderManager />
            </TabsContent>
            <TabsContent value="reports" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <ReportDashboard />
            </TabsContent>
          </Tabs>
        </section>
      )}

      {/* Equipment Hub */}
      <section className="px-2">
        <BorderSelector />
      </section>

      {/* Footer Command */}
      <div className="px-2">
        <button onClick={handleLogout} className="w-full flex items-center justify-between p-8 bg-red-600/5 border border-red-600/10 rounded-[2.5rem] group hover:bg-red-600 transition-all shadow-xl">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <LogOut className="w-6 h-6 text-red-500 group-hover:text-white" />
            </div>
            <div className="text-left space-y-1">
              <p className="text-[12px] font-black uppercase tracking-widest text-red-500 group-hover:text-white">Terminate Connection</p>
              <p className="text-[8px] text-neutral-600 group-hover:text-white/60 font-black uppercase tracking-widest">Securely end global synchronization</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-800 group-hover:text-white group-hover:translate-x-2 transition-all" />
        </button>
      </div>

      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent side="bottom" className="h-[85vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[4rem] p-0 overflow-y-auto">
          <ProfileEditor onClose={() => setIsEditorOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default RequireAuth(ProfilePage);
