
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
        toast({ title: "Identity Registered" });
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
      <div className="max-w-sm mx-auto py-32 space-y-12 animate-in fade-in duration-1000">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent/5 rounded-[2rem] flex items-center justify-center mx-auto border border-accent/10 shadow-2xl shadow-accent/10">
            <User className="w-8 h-8 text-accent" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tighter uppercase text-glow">Authorize</h1>
            <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40">Connecting to global node</p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2.5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-accent transition-colors duration-500" />
              <input 
                type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-xl pl-12 pr-5 py-3.5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-black text-[10px] uppercase tracking-widest shadow-2xl"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-accent transition-colors duration-500" />
              <input 
                type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="CORE PASSKEY" 
                className="w-full bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-xl pl-12 pr-5 py-3.5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-black text-[10px] uppercase tracking-widest shadow-2xl"
              />
            </div>
          </div>
          <button 
            type="submit" disabled={authLoading}
            className="w-full py-4 bg-white text-black font-black rounded-xl flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all duration-500 text-[10px] uppercase tracking-widest shadow-2xl active:scale-95"
          >
            {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
            {isSignUp ? 'REGISTER' : 'AUTHORIZE'}
          </button>
        </form>

        <div className="text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-accent transition-colors duration-500">
            {isSignUp ? 'BACK TO LOGIN' : "CREATE NEW ACCOUNT"}
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
              <div className="w-24 h-24 rounded-[2rem] bg-accent/5 border border-accent/20 overflow-hidden relative shadow-2xl">
                {photoUrl ? (
                  <img src={photoUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-10 h-10 text-accent/20" /></div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 max-w-sm mx-auto w-full">
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-accent ml-1">Operative Alias</label>
              <input 
                type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-black text-[10px] uppercase tracking-widest shadow-2xl"
                placeholder="Enter alias..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-accent ml-1">Transmission Log (Bio)</label>
              <textarea 
                value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                className="w-full bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-medium text-[10px] leading-relaxed resize-none shadow-2xl"
                placeholder="Operational history..."
              />
            </div>
          </div>

          <button 
            onClick={handleSaveProfile} disabled={saving}
            className="w-full max-w-sm mx-auto py-4 bg-white text-black font-black rounded-xl flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all duration-500 uppercase tracking-widest text-[10px] shadow-2xl"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            COMMIT OVERRIDES
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-[#0a0a0f]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent z-0" />
            <div className="relative z-10 w-24 h-24 rounded-[1.5rem] bg-accent/5 border border-accent/20 flex items-center justify-center text-accent font-black text-3xl overflow-hidden shadow-2xl">
               {profile?.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : profile?.displayName?.[0] || 'A'}
            </div>
            
            <div className="relative z-10 flex-1 text-center sm:text-left space-y-3">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black tracking-tighter leading-none text-glow uppercase">{profile?.displayName || 'Unknown'}</h2>
                <p className="text-[8px] font-black text-accent uppercase tracking-[0.4em] opacity-80">Rank: Elite Navigator</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium line-clamp-2 max-w-xs opacity-60 leading-relaxed mx-auto sm:mx-0">{profile?.bio || 'Synchronizing with global nodes...'}</p>
            </div>
            
            <button onClick={() => setIsEditing(true)} className="relative z-10 p-3.5 glass rounded-xl text-muted-foreground hover:text-white transition-all hover:border-accent/30 shadow-2xl">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <div className="p-6 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-[1.5rem] text-center space-y-1 group hover:border-accent/40 transition-all duration-500 shadow-2xl">
               <Bookmark className="w-4 h-4 text-accent mx-auto mb-1 opacity-30 group-hover:opacity-100 transition-opacity" />
               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Archive</p>
               <p className="text-2xl font-black text-glow text-accent">{bookmarks.length}</p>
             </div>
             <div className="p-6 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-[1.5rem] text-center space-y-1 group hover:border-accent/40 transition-all duration-500 shadow-2xl">
               <Cpu className="w-4 h-4 text-accent mx-auto mb-1 opacity-30 group-hover:opacity-100 transition-opacity" />
               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Core</p>
               <p className="text-2xl font-black text-white">99%</p>
             </div>
             <div className="hidden md:block p-6 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-[1.5rem] text-center space-y-1 group hover:border-accent/40 transition-all duration-500 shadow-2xl">
               <Zap className="w-4 h-4 text-accent mx-auto mb-1 opacity-30 group-hover:opacity-100 transition-opacity" />
               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Signal</p>
               <p className="text-2xl font-black text-indigo-400">Stable</p>
             </div>
          </div>

          <section className="space-y-4">
             <h3 className="text-[9px] font-black tracking-[0.4em] uppercase px-4 text-glow opacity-60">Preferences</h3>
             <div className="grid gap-3">
               <div className="flex items-center justify-between p-6 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-[1.5rem] shadow-2xl">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center border border-accent/10">
                     <Bell className="w-5 h-5 text-accent" />
                   </div>
                   <div className="space-y-0.5">
                     <p className="text-[11px] font-black uppercase tracking-widest">Alerts</p>
                     <p className="text-[8px] text-muted-foreground uppercase tracking-widest opacity-40">Chapter sync</p>
                   </div>
                 </div>
                 <Switch checked={appSettings.notifications} onCheckedChange={(val) => updateAppSettings({ notifications: val })} />
               </div>

               <div className="flex items-center justify-between p-6 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-[1.5rem] shadow-2xl">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center border border-accent/10">
                     <Cloud className="w-5 h-5 text-accent" />
                   </div>
                   <div className="space-y-0.5">
                     <p className="text-[11px] font-black uppercase tracking-widest">Hi-Fi</p>
                     <p className="text-[8px] text-muted-foreground uppercase tracking-widest opacity-40">Max bandwidth</p>
                   </div>
                 </div>
                 <Switch checked={appSettings.highQualityImages} onCheckedChange={(val) => updateAppSettings({ highQualityImages: val })} />
               </div>
             </div>
          </section>

          <div className="grid sm:grid-cols-2 gap-3">
            <button 
              onClick={() => { clearCache(); toast({ title: "Cache Purged" }); }}
              className="flex items-center justify-between p-6 bg-accent/5 border border-accent/10 rounded-[1.5rem] text-accent hover:bg-accent/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <Trash2 className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest text-[9px]">Wipe Cache</span>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[1.5rem] text-white hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <LogOut className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest text-[9px]">Terminate</span>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
