"use client";

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  User, Settings, LogOut, Loader2, Mail, Lock, 
  Camera, Save, Bell, Cloud, Trash2, ArrowRight, Bookmark,
  Cpu, Terminal, Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUIStore } from '@/store/ui';
import { Switch } from '@/components/ui/switch';

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const { 
    appSettings, updateAppSettings, clearCache, bookmarks 
  } = useUIStore();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const profileRef = React.useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setPhotoUrl(profile.photoUrl || '');
    }
  }, [profile]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        toast({ title: "Neural Link Established" });
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        toast({ title: "Authorized" });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Protocol Failure", description: error.message });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        bio,
        photoUrl,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "Core Synced" });
      setIsEditing(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Failure" });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 space-y-12 animate-in fade-in duration-1000 relative">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto border border-accent/20 shadow-2xl shadow-accent/10">
            <Zap className="w-10 h-10 text-accent animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black tracking-tighter uppercase text-glow">Establish Core</h1>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-40">Identifying unique operative node</p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-3">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-accent transition-colors duration-500" />
              <input 
                type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Database ID (Email)" 
                className="w-full bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-2xl pl-14 pr-5 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-black text-[11px] relative z-10 uppercase tracking-widest shadow-2xl"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-accent transition-colors duration-500" />
              <input 
                type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Core Passkey" 
                className="w-full bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-2xl pl-14 pr-5 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-black text-[11px] relative z-10 uppercase tracking-widest shadow-2xl"
              />
            </div>
          </div>
          <button 
            type="submit" disabled={authLoading}
            className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-accent hover:text-white transition-all duration-500 text-[11px] uppercase tracking-[0.2em] shadow-2xl"
          >
            {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Terminal className="w-5 h-5" />}
            {isSignUp ? 'Establish Identity' : 'Authorize Link'}
          </button>
        </form>

        <div className="text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-accent transition-colors duration-500">
            {isSignUp ? 'Return to Sync' : "Register New Operative"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-24 animate-in fade-in duration-1000">
      {isEditing ? (
        <div className="space-y-10 animate-in slide-in-from-bottom-4">
           <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tighter uppercase text-glow">Identity Override</h2>
            <button onClick={() => setIsEditing(false)} className="px-5 py-2 glass rounded-xl text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-white transition-all">Abort</button>
          </div>

          <div className="flex flex-col items-center gap-6 py-4">
            <div className="relative group cursor-pointer">
              <div className="w-28 h-28 rounded-[2.5rem] bg-accent/5 border border-accent/20 overflow-hidden relative shadow-2xl">
                {photoUrl ? (
                  <img src={photoUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-12 h-12 text-accent/20" /></div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-accent ml-2">Operative Alias</label>
              <input 
                type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-black text-[12px] uppercase tracking-widest shadow-2xl"
                placeholder="Enter new signal alias..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-accent ml-2">Transmission Log (Bio)</label>
              <textarea 
                value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                className="w-full bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-medium text-[12px] leading-relaxed resize-none shadow-2xl"
                placeholder="Brief operational history..."
              />
            </div>
          </div>

          <button 
            onClick={handleSaveProfile} disabled={saving}
            className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-accent hover:text-white transition-all duration-500 uppercase tracking-[0.2em] text-[11px] shadow-2xl"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Commit Overrides
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center gap-10 p-10 bg-[#0a0a0f]/40 backdrop-blur-xl border border-white/5 rounded-[3rem] relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent z-0" />
            <div className="relative z-10 w-28 h-28 rounded-[2rem] bg-accent/5 border border-accent/20 flex items-center justify-center text-accent font-black text-4xl overflow-hidden shadow-2xl">
               {profile?.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : profile?.displayName?.[0] || 'A'}
            </div>
            
            <div className="relative z-10 flex-1 text-center sm:text-left space-y-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter leading-none text-glow uppercase">{profile?.displayName || 'Unknown Operative'}</h2>
                <p className="text-[9px] font-black text-accent uppercase tracking-[0.3em] opacity-80">Rank: Elite Node Navigator</p>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium line-clamp-3 max-w-sm opacity-60 leading-relaxed">{profile?.bio || 'Synchronizing with global neural network nodes...'}</p>
            </div>
            
            <button onClick={() => setIsEditing(true)} className="relative z-10 p-4 glass rounded-2xl text-muted-foreground hover:text-white transition-all hover:border-accent/30 shadow-2xl">
              <Settings className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
             <div className="p-8 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-[2rem] text-center space-y-2 group hover:border-accent/40 transition-all duration-500 shadow-2xl">
               <Bookmark className="w-5 h-5 text-accent mx-auto mb-2 opacity-30 group-hover:opacity-100 transition-opacity" />
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Archived</p>
               <p className="text-3xl font-black text-glow text-accent">{bookmarks.length}</p>
             </div>
             <div className="p-8 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-[2rem] text-center space-y-2 group hover:border-accent/40 transition-all duration-500 shadow-2xl">
               <Cpu className="w-5 h-5 text-accent mx-auto mb-2 opacity-30 group-hover:opacity-100 transition-opacity" />
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Efficiency</p>
               <p className="text-3xl font-black text-white">99%</p>
             </div>
             <div className="hidden md:block p-8 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-[2rem] text-center space-y-2 group hover:border-accent/40 transition-all duration-500 shadow-2xl">
               <Zap className="w-5 h-5 text-accent mx-auto mb-2 opacity-30 group-hover:opacity-100 transition-opacity" />
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Signal</p>
               <p className="text-3xl font-black text-indigo-400">Stable</p>
             </div>
          </div>

          <section className="space-y-6">
             <h3 className="text-[10px] font-black tracking-[0.3em] uppercase px-4 text-glow opacity-60">Neural Matrix Parameters</h3>
             <div className="grid gap-4">
               <div className="flex items-center justify-between p-8 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-[2rem] shadow-2xl group hover:border-accent/20 transition-all">
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center border border-accent/10">
                     <Bell className="w-6 h-6 text-accent" />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[12px] font-black uppercase tracking-widest">Spectral Alerts</p>
                     <p className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-40">Real-time chapter sync</p>
                   </div>
                 </div>
                 <Switch checked={appSettings.notifications} onCheckedChange={(val) => updateAppSettings({ notifications: val })} />
               </div>

               <div className="flex items-center justify-between p-8 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-[2rem] shadow-2xl group hover:border-accent/20 transition-all">
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center border border-accent/10">
                     <Cloud className="w-6 h-6 text-accent" />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[12px] font-black uppercase tracking-widest">High-Fi Nodes</p>
                     <p className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-40">Max bandwidth rendering</p>
                   </div>
                 </div>
                 <Switch checked={appSettings.highQualityImages} onCheckedChange={(val) => updateAppSettings({ highQualityImages: val })} />
               </div>
             </div>
          </section>

          <div className="grid sm:grid-cols-2 gap-4">
            <button 
              onClick={() => { clearCache(); toast({ title: "Node Purged" }); }}
              className="flex items-center justify-between p-8 bg-accent/5 border border-accent/10 rounded-[2rem] text-accent hover:bg-accent/10 transition-all group shadow-2xl"
            >
              <div className="flex items-center gap-5">
                <Trash2 className="w-6 h-6" />
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Wipe Node Cache</span>
              </div>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[2rem] text-white hover:bg-white/10 transition-all group shadow-2xl"
            >
              <div className="flex items-center gap-5">
                <LogOut className="w-6 h-6" />
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Terminate Session</span>
              </div>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
