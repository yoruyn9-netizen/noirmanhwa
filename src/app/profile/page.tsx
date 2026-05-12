
"use client";

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  User, Settings, LogOut, Loader2, Mail, Lock, LogIn, 
  Camera, Save, Bell, Cloud, Shield, Trash2, ArrowRight, Bookmark
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
        toast({ title: "Link Established", description: "Account created." });
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        toast({ title: "Authorized", description: "Welcome back." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Auth Failed", description: error.message });
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
      toast({ title: "Profile Synced", description: "Data committed to node." });
      setIsEditing(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto border border-accent/20">
            <User className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Establish Link</h1>
          <p className="text-sm text-muted-foreground font-medium">Synchronize your identity with the Noir network.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="Node Address (Email)" 
              className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Passkey" 
              className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </div>
          <button 
            type="submit" disabled={authLoading}
            className="w-full py-5 bg-accent text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-red-600 transition-all active:scale-95"
          >
            {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {isSignUp ? 'CREATE NODE' : 'INITIALIZE LINK'}
          </button>
        </form>

        <div className="text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-accent transition-colors">
            {isSignUp ? 'Already registered? Sync Node' : "New Entity? Register Node"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {isEditing ? (
        <div className="space-y-10">
           <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter uppercase">Edit Identity</h2>
            <button onClick={() => setIsEditing(false)} className="text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-accent/10 border-2 border-accent/20 overflow-hidden shadow-2xl">
                {photoUrl ? (
                  <img src={photoUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-16 h-16 text-accent/50" /></div>
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 bg-accent rounded-2xl shadow-2xl border-4 border-[#050508]">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Alias</label>
              <input 
                type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-accent/50 font-bold"
                placeholder="Enter display name..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Transmission Data (Bio)</label>
              <textarea 
                value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-accent/50 font-medium resize-none"
                placeholder="Share your story..."
              />
            </div>
          </div>

          <button 
            onClick={handleSaveProfile} disabled={saving}
            className="w-full py-5 bg-accent text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-red-600 transition-all"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            COMMIT CHANGES
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-center gap-8 p-10 bg-[#0f0f13] border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent z-0" />
            <div className="relative z-10 w-28 h-28 rounded-[2rem] bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-accent font-black text-4xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform">
               {profile?.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : profile?.displayName?.[0] || 'A'}
            </div>
            <div className="relative z-10 flex-1 text-center md:text-left space-y-3">
              <h2 className="text-4xl font-black tracking-tighter leading-none">{profile?.displayName || 'Noir Agent'}</h2>
              <p className="text-sm text-muted-foreground font-medium line-clamp-2 max-w-md">{profile?.bio || 'Establishing synaptic link to the network...'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <div className="px-4 py-1.5 bg-accent/10 border border-accent/10 rounded-full text-[9px] font-black uppercase tracking-widest text-accent">Active Protocol</div>
                <div className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-muted-foreground">{user.email}</div>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)} className="relative z-10 p-4 glass rounded-2xl text-muted-foreground hover:text-white transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <div className="p-6 bg-[#0f0f13] border border-white/5 rounded-3xl text-center space-y-1">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Library</p>
               <p className="text-3xl font-black text-accent">{bookmarks.length}</p>
             </div>
             <div className="p-6 bg-[#0f0f13] border border-white/5 rounded-3xl text-center space-y-1">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sync Level</p>
               <p className="text-3xl font-black text-white">LVL 42</p>
             </div>
             <div className="hidden md:block p-6 bg-[#0f0f13] border border-white/5 rounded-3xl text-center space-y-1">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</p>
               <p className="text-3xl font-black text-green-500">ONLINE</p>
             </div>
          </div>

          <section className="space-y-4">
             <h3 className="text-xl font-black tracking-tighter uppercase px-1">System Preferences</h3>
             <div className="grid gap-3">
               <div className="flex items-center justify-between p-6 bg-[#0f0f13] border border-white/5 rounded-2xl shadow-xl">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-accent/10 rounded-xl"><Bell className="w-6 h-6 text-accent" /></div>
                   <div>
                     <p className="text-sm font-black uppercase tracking-widest">Notifications</p>
                     <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Instant chapter alerts</p>
                   </div>
                 </div>
                 <Switch checked={appSettings.notifications} onCheckedChange={(val) => updateAppSettings({ notifications: val })} />
               </div>

               <div className="flex items-center justify-between p-6 bg-[#0f0f13] border border-white/5 rounded-2xl shadow-xl">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-accent/10 rounded-xl"><Cloud className="w-6 h-6 text-accent" /></div>
                   <div>
                     <p className="text-sm font-black uppercase tracking-widest">Ultra Imagery</p>
                     <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Max resolution nodes</p>
                   </div>
                 </div>
                 <Switch checked={appSettings.highQualityImages} onCheckedChange={(val) => updateAppSettings({ highQualityImages: val })} />
               </div>
             </div>
          </section>

          <div className="space-y-3">
            <button 
              onClick={() => { clearCache(); toast({ title: "Memory Wiped" }); }}
              className="w-full flex items-center justify-between p-6 bg-accent/5 border border-accent/10 rounded-3xl text-accent hover:bg-accent/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <Trash2 className="w-6 h-6" />
                <span className="font-black uppercase tracking-widest text-sm">Purge Database</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl text-white hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <LogOut className="w-6 h-6" />
                <span className="font-black uppercase tracking-widest text-sm">Terminate Session</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
