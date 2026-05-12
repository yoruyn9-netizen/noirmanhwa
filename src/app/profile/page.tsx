"use client";

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  User, Settings, LogOut, Loader2, Mail, Lock, 
  Camera, Save, Bell, Cloud, Shield, Trash2, ArrowRight, Bookmark,
  Cpu, Terminal, Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
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
        toast({ title: "Node Established" });
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
      toast({ title: "Sync Complete" });
      setIsEditing(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Failure" });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-sm mx-auto py-16 space-y-12 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto border border-accent/20">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter uppercase text-glow">Establish Link</h1>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Identify node to network</p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-3">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input 
                type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email Address" 
                className="w-full bg-[#0f0f13] border border-white/5 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[12px] relative z-10"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input 
                type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Passkey" 
                className="w-full bg-[#0f0f13] border border-white/5 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[12px] relative z-10"
              />
            </div>
          </div>
          <button 
            type="submit" disabled={authLoading}
            className="w-full py-4 bg-white text-black font-black rounded-xl flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all text-[10px] uppercase tracking-widest"
          >
            {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
            {isSignUp ? 'Establish Node' : 'Initialize Link'}
          </button>
        </form>

        <div className="text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-accent transition-colors">
            {isSignUp ? 'Sync Node' : "Register Node"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {isEditing ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-2">
           <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight uppercase text-glow">Identity Override</h2>
            <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-muted-foreground uppercase tracking-widest">Cancel</button>
          </div>

          <div className="flex flex-col items-center gap-6 py-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-[2rem] bg-accent/5 border border-accent/20 overflow-hidden relative">
                {photoUrl ? (
                  <img src={photoUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-10 h-10 text-accent/30" /></div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Alias</label>
              <input 
                type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0f0f13] border border-white/5 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[12px]"
                placeholder="Alias signal..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Bio</label>
              <textarea 
                value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                className="w-full bg-[#0f0f13] border border-white/5 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-medium text-[12px] resize-none"
                placeholder="Transmission history..."
              />
            </div>
          </div>

          <button 
            onClick={handleSaveProfile} disabled={saving}
            className="w-full py-4 bg-white text-black font-black rounded-xl flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all uppercase tracking-widest text-[10px]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Commit Override
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-[#0f0f13] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent z-0" />
            <div className="relative z-10 w-24 h-24 rounded-[1.5rem] bg-accent/5 border border-accent/20 flex items-center justify-center text-accent font-black text-3xl overflow-hidden">
               {profile?.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : profile?.displayName?.[0] || 'A'}
            </div>
            
            <div className="relative z-10 flex-1 text-center sm:text-left space-y-2">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black tracking-tighter leading-none text-glow">{profile?.displayName || 'Noir Operative'}</h2>
                <p className="text-[8px] font-black text-accent uppercase tracking-widest">Rank: Legendary Node</p>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 max-w-sm opacity-70">{profile?.bio || 'Initializing neural link...'}</p>
            </div>
            
            <button onClick={() => setIsEditing(true)} className="relative z-10 p-3 glass rounded-xl text-muted-foreground hover:text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <div className="p-6 bg-[#0f0f13] border border-white/5 rounded-2xl text-center space-y-1 group hover:border-accent/30 transition-all">
               <Bookmark className="w-4 h-4 text-accent mx-auto mb-1 opacity-50 group-hover:opacity-100" />
               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Archive</p>
               <p className="text-2xl font-black text-accent">{bookmarks.length}</p>
             </div>
             <div className="p-6 bg-[#0f0f13] border border-white/5 rounded-2xl text-center space-y-1 group hover:border-accent/30 transition-all">
               <Cpu className="w-4 h-4 text-accent mx-auto mb-1 opacity-50 group-hover:opacity-100" />
               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Level</p>
               <p className="text-2xl font-black text-white">88</p>
             </div>
             <div className="hidden md:block p-6 bg-[#0f0f13] border border-white/5 rounded-2xl text-center space-y-1 group hover:border-accent/30 transition-all">
               <Zap className="w-4 h-4 text-accent mx-auto mb-1 opacity-50 group-hover:opacity-100" />
               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Status</p>
               <p className="text-2xl font-black text-green-500">Stable</p>
             </div>
          </div>

          <section className="space-y-6">
             <h3 className="text-sm font-black tracking-tight uppercase px-2 text-glow">Matrix Parameters</h3>
             <div className="grid gap-3">
               <div className="flex items-center justify-between p-6 bg-[#0f0f13] border border-white/5 rounded-2xl">
                 <div className="flex items-center gap-4">
                   <Bell className="w-5 h-5 text-accent" />
                   <div className="space-y-0.5">
                     <p className="text-[11px] font-black uppercase tracking-widest">Chapter Pulses</p>
                     <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Real-time alerts</p>
                   </div>
                 </div>
                 <Switch checked={appSettings.notifications} onCheckedChange={(val) => updateAppSettings({ notifications: val })} />
               </div>

               <div className="flex items-center justify-between p-6 bg-[#0f0f13] border border-white/5 rounded-2xl">
                 <div className="flex items-center gap-4">
                   <Cloud className="w-5 h-5 text-accent" />
                   <div className="space-y-0.5">
                     <p className="text-[11px] font-black uppercase tracking-widest">Ultra-HD Nodes</p>
                     <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Maximum bandwidth</p>
                   </div>
                 </div>
                 <Switch checked={appSettings.highQualityImages} onCheckedChange={(val) => updateAppSettings({ highQualityImages: val })} />
               </div>
             </div>
          </section>

          <div className="grid sm:grid-cols-2 gap-3">
            <button 
              onClick={() => { clearCache(); toast({ title: "Purged" }); }}
              className="flex items-center justify-between p-6 bg-accent/5 border border-accent/10 rounded-2xl text-accent hover:bg-accent/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <Trash2 className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest text-[9px]">Purge Storage</span>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <LogOut className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest text-[9px]">Terminate Link</span>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}