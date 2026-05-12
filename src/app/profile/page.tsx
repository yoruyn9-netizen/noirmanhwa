"use client";

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  User, Settings, LogOut, Loader2, Mail, Lock, LogIn, 
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
        toast({ title: "Link Established", description: "Node created successfully." });
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        toast({ title: "Authorized", description: "Welcome back to the Noir Network." });
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
      toast({ title: "Sync Complete", description: "Identity data committed to node." });
      setIsEditing(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Failure" });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-accent/10 rounded-[2rem] flex items-center justify-center mx-auto border border-accent/20 shadow-[0_0_30px_rgba(153,27,27,0.2)]">
            <Shield className="w-12 h-12 text-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-glow">Establish Link</h1>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Identify node to noir network</p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input 
                type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Node Address (Email)" 
                className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-all font-bold text-sm relative z-10"
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input 
                type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Passkey" 
                className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-all font-bold text-sm relative z-10"
              />
            </div>
          </div>
          <button 
            type="submit" disabled={authLoading}
            className="w-full py-6 bg-white text-black font-black rounded-2xl shadow-[0_15px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 hover:bg-accent hover:text-white transition-all duration-500 active:scale-95 text-xs uppercase tracking-[0.2em]"
          >
            {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Terminal className="w-5 h-5" />}
            {isSignUp ? 'ESTABLISH NEW NODE' : 'INITIALIZE LINK'}
          </button>
        </form>

        <div className="text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-accent transition-colors">
            {isSignUp ? 'Already identified? Sync Node' : "New Entity Detected? Register Node"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-16 pb-20 animate-in fade-in duration-1000">
      {isEditing ? (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
           <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tighter uppercase text-glow">Identity Override</h2>
            <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
          </div>

          <div className="flex flex-col items-center gap-8 py-8">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[3rem] bg-accent/5 border-2 border-accent/20 overflow-hidden shadow-2xl relative">
                {photoUrl ? (
                  <img src={photoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-20 h-20 text-accent/30" /></div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 p-4 bg-accent rounded-2xl shadow-[0_0_20px_rgba(153,27,27,0.5)] border-4 border-[#050508] text-white hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Alias Signal</label>
              <input 
                type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl px-8 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold shadow-xl"
                placeholder="Enter unique alias..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Neural Transmission (Bio)</label>
              <textarea 
                value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl px-8 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-medium resize-none shadow-xl"
                placeholder="Share your node's history..."
              />
            </div>
          </div>

          <button 
            onClick={handleSaveProfile} disabled={saving}
            className="w-full py-6 bg-white text-black font-black rounded-2xl shadow-2xl flex items-center justify-center gap-4 hover:bg-accent hover:text-white transition-all duration-500 uppercase tracking-[0.2em] text-xs"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            COMMIT DATA OVERRIDE
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-center gap-10 p-12 bg-[#0f0f13] border border-white/5 rounded-[4rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent z-0" />
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-40 h-40 text-accent" />
            </div>
            
            <div className="relative z-10 w-32 h-32 rounded-[2.5rem] bg-accent/5 border-2 border-accent/20 flex items-center justify-center text-accent font-black text-5xl overflow-hidden shadow-[0_0_40px_rgba(153,27,27,0.3)] group-hover:scale-105 transition-transform duration-700">
               {profile?.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : profile?.displayName?.[0] || 'A'}
            </div>
            
            <div className="relative z-10 flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <h2 className="text-5xl font-black tracking-tighter leading-none text-glow">{profile?.displayName || 'Noir Operative'}</h2>
                <p className="text-xs font-black text-accent uppercase tracking-[0.4em]">RANK: LEGENDARY NODE</p>
              </div>
              <p className="text-sm text-muted-foreground font-medium line-clamp-2 max-w-md opacity-70 leading-relaxed">{profile?.bio || 'Initializing neural link to the vast manga network. All frequencies are currently stable...'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                <div className="px-5 py-2 bg-accent/10 border border-accent/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-accent">Status: Active</div>
                <div className="px-5 py-2 bg-white/5 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{user.email}</div>
              </div>
            </div>
            
            <button onClick={() => setIsEditing(true)} className="relative z-10 p-5 glass rounded-2xl text-muted-foreground hover:text-white hover:bg-white/10 transition-all active:scale-90">
              <Settings className="w-7 h-7" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
             <div className="p-8 bg-[#0f0f13] border border-white/5 rounded-[2.5rem] text-center space-y-2 shadow-2xl group hover:border-accent/30 transition-all">
               <Bookmark className="w-6 h-6 text-accent mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Archive Size</p>
               <p className="text-4xl font-black text-accent">{bookmarks.length}</p>
             </div>
             <div className="p-8 bg-[#0f0f13] border border-white/5 rounded-[2.5rem] text-center space-y-2 shadow-2xl group hover:border-accent/30 transition-all">
               <Cpu className="w-6 h-6 text-accent mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Sync Level</p>
               <p className="text-4xl font-black text-white">LVL 88</p>
             </div>
             <div className="hidden md:block p-8 bg-[#0f0f13] border border-white/5 rounded-[2.5rem] text-center space-y-2 shadow-2xl group hover:border-accent/30 transition-all">
               < Zap className="w-6 h-6 text-accent mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Neural Status</p>
               <p className="text-4xl font-black text-green-500">STABLE</p>
             </div>
          </div>

          <section className="space-y-8">
             <h3 className="text-2xl font-black tracking-tighter uppercase px-2 text-glow">System Matrix</h3>
             <div className="grid gap-4">
               <div className="flex items-center justify-between p-8 bg-[#0f0f13] border border-white/5 rounded-[2rem] shadow-2xl group hover:bg-white/5 transition-all">
                 <div className="flex items-center gap-6">
                   <div className="p-4 bg-accent/5 rounded-2xl group-hover:bg-accent/10 transition-all"><Bell className="w-7 h-7 text-accent" /></div>
                   <div className="space-y-1">
                     <p className="text-base font-black uppercase tracking-widest">Chapter Pulses</p>
                     <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Real-time synchronization alerts</p>
                   </div>
                 </div>
                 <Switch checked={appSettings.notifications} onCheckedChange={(val) => updateAppSettings({ notifications: val })} />
               </div>

               <div className="flex items-center justify-between p-8 bg-[#0f0f13] border border-white/5 rounded-[2rem] shadow-2xl group hover:bg-white/5 transition-all">
                 <div className="flex items-center gap-6">
                   <div className="p-4 bg-accent/5 rounded-2xl group-hover:bg-accent/10 transition-all"><Cloud className="w-7 h-7 text-accent" /></div>
                   <div className="space-y-1">
                     <p className="text-base font-black uppercase tracking-widest">Ultra-HD Nodes</p>
                     <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Maximum visual bandwidth utilization</p>
                   </div>
                 </div>
                 <Switch checked={appSettings.highQualityImages} onCheckedChange={(val) => updateAppSettings({ highQualityImages: val })} />
               </div>
             </div>
          </section>

          <div className="grid md:grid-cols-2 gap-4">
            <button 
              onClick={() => { clearCache(); toast({ title: "Database Purged" }); }}
              className="flex items-center justify-between p-8 bg-accent/5 border border-accent/10 rounded-[2.5rem] text-accent hover:bg-accent/10 transition-all group overflow-hidden relative shadow-xl"
            >
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-6 relative z-10">
                <Trash2 className="w-7 h-7" />
                <span className="font-black uppercase tracking-[0.2em] text-xs">Purge Local Storage</span>
              </div>
              <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-2" />
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-white hover:bg-white/10 transition-all group overflow-hidden relative shadow-xl"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-6 relative z-10">
                <LogOut className="w-7 h-7" />
                <span className="font-black uppercase tracking-[0.2em] text-xs">Terminate Link</span>
              </div>
              <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-2" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}