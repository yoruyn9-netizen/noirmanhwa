"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import { 
  X, Search, Bookmark, Grid, User, Trash2, Settings, ArrowRight, Check, 
  Camera, Save, ArrowLeft, Loader2, Bell, Shield, Cloud, LogIn, Mail, Lock,
  History, LogOut, LayoutGrid, Chrome
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useUser, useFirestore, useDoc, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function BottomSheet() {
  const { 
    activePanel, isOpen, closePanel, openPanel, bookmarks, 
    removeBookmark, readerSettings, updateReaderSettings,
    appSettings, updateAppSettings, clearCache
  } = useUIStore();
  
  const sheetRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const profileRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setPhotoUrl(profile.photoUrl || '');
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Limit is 800KB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "You must be signed in." });
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        bio,
        photoUrl,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: "Transmission Updated", description: "Profile data synced." });
      openPanel('profile');
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setSaving(false);
    }
  };

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
      openPanel('profile');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Auth Failed", description: error.message });
    } finally {
      setAuthLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activePanel) {
      case 'editProfile':
        return (
          <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <button onClick={() => openPanel('profile')} className="p-3 glass rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black tracking-tighter uppercase">Modify Identity</h2>
              <div className="w-11" />
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-[2rem] bg-accent/10 border-2 border-accent/20 overflow-hidden shadow-2xl">
                  {photoUrl ? (
                    <img src={photoUrl} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><User className="w-12 h-12 text-accent/50" /></div>
                  )}
                </div>
                <button 
                  className="absolute -bottom-2 -right-2 p-3 bg-accent rounded-2xl shadow-[0_0_20px_rgba(153,27,27,0.5)] border-2 border-background"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Update visual ID</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Codename</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  placeholder="Enter username..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Biography</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
                  placeholder="Transmission description..."
                />
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-5 bg-accent text-white font-black rounded-2xl shadow-[0_10px_20px_rgba(153,27,27,0.3)] flex items-center justify-center gap-3 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              SYNC PROFILE
            </button>
          </div>
        );

      case 'profile':
        if (!user) {
          return (
            <div className="p-8 space-y-10">
              <div className="space-y-3">
                <h2 className="text-4xl font-black tracking-tighter">ESTABLISH LINK</h2>
                <p className="text-sm text-muted-foreground font-medium">Connect to the Noir network to synchronize your library and identity.</p>
              </div>
              
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="E-mail" 
                    className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Passkey" 
                    className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <button 
                  type="submit" disabled={authLoading}
                  className="w-full py-5 bg-accent text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-red-600 transition-all"
                >
                  {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  {isSignUp ? 'CREATE NODE' : 'INITIALIZE'}
                </button>
              </form>

              <div className="text-center">
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-accent transition-colors">
                  {isSignUp ? 'Already connected? Link Node' : "New entity? Create Node"}
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="p-8 space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[1.5rem] bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-accent font-black text-3xl overflow-hidden shadow-xl">
                {profile?.photoUrl ? <img src={profile.photoUrl} className="w-full h-full object-cover" /> : profile?.displayName?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-black tracking-tighter truncate leading-none">{profile?.displayName || 'Noir Agent'}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-black text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded-md border border-accent/10">Active Member</span>
                </div>
              </div>
              <button onClick={() => openPanel('editProfile')} className="p-3 glass rounded-2xl text-muted-foreground hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-[#0f0f13] rounded-2xl border border-white/5 text-center space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Bookmarks</p>
                <p className="text-2xl font-black text-accent">{bookmarks.length}</p>
              </div>
              <div className="p-5 bg-[#0f0f13] rounded-2xl border border-white/5 text-center space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">History</p>
                <p className="text-2xl font-black text-white">42</p>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={() => openPanel('editProfile')} className="w-full flex items-center justify-between p-5 bg-[#0f0f13] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <User className="w-5 h-5 text-accent" />
                  <span className="font-bold text-sm">Identity Settings</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button onClick={() => openPanel('appSettings')} className="w-full flex items-center justify-between p-5 bg-[#0f0f13] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <Settings className="w-5 h-5 text-accent" />
                  <span className="font-bold text-sm">Neural Preferences</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button onClick={() => signOut(auth)} className="w-full flex items-center justify-between p-5 bg-accent/5 border border-accent/10 rounded-2xl hover:bg-accent/10 transition-all group">
                <div className="flex items-center gap-4 text-accent">
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold text-sm">Disconnect Node</span>
                </div>
                <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 'genre':
        return (
          <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                <LayoutGrid className="w-8 h-8 text-accent" /> EXPLORE FREQUENCIES
              </h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Filter titles by neural signatures</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
              {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Martial Arts', 'Romance', 'Sci-Fi', 'Thriller', 'Isekai', 'Supernatural', 'Historical', 'Mystery', 'School Life', 'Slice of Life'].map(genre => (
                <button 
                  key={genre}
                  onClick={() => { router.push(`/search?genre=${genre}`); closePanel(); }}
                  className="p-6 text-center bg-[#0f0f13] rounded-2xl border border-white/5 hover:border-accent/40 hover:bg-accent/10 transition-all font-black uppercase text-[10px] tracking-widest shadow-xl"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'search':
        return (
          <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <Search className="w-8 h-8 text-accent" /> SEARCH NEURAL DATABASE
            </h2>
            <div className="relative">
              <input 
                autoFocus type="text" placeholder="Title, author, or publisher..." 
                className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-accent/50 text-lg font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { router.push(`/search?q=${(e.target as HTMLInputElement).value}`); closePanel(); }
                }}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 p-2 bg-accent rounded-xl">
                 <Search className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hottest Pulses</p>
              <div className="flex flex-wrap gap-2">
                {['Solo Leveling', 'Lookism', 'Tower of God', 'Beginning After End', 'Omniscient Reader'].map(t => (
                  <button key={t} onClick={() => { router.push(`/search?q=${t}`); closePanel(); }} className="px-5 py-2.5 bg-[#0f0f13] border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'bookmark':
        return (
          <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between">
               <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                <Bookmark className="w-8 h-8 text-accent" /> NEURAL LIBRARY
              </h2>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{bookmarks.length} Titles</span>
             </div>
            {bookmarks.length === 0 ? (
              <div className="text-center py-20 space-y-6 glass rounded-[2rem] border-dashed border-white/10">
                <Bookmark className="w-16 h-16 text-muted-foreground/10 mx-auto" />
                <div className="space-y-2">
                  <p className="text-muted-foreground font-medium">Your library database is empty.</p>
                  <button onClick={() => { router.push('/'); closePanel(); }} className="text-accent font-black text-xs uppercase tracking-widest hover:underline">Start Syncing</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
                {bookmarks.map((manga) => (
                  <div key={manga.id} className="flex gap-5 p-4 bg-[#0f0f13] rounded-2xl border border-white/5 group relative hover:border-accent/30 transition-all">
                    <img 
                      src={manga.coverUrl} alt={manga.title} 
                      className="w-20 h-28 object-cover rounded-xl flex-shrink-0 cursor-pointer shadow-2xl"
                      onClick={() => { router.push(`/series/${manga.id}`); closePanel(); }}
                    />
                    <div className="flex-1 min-w-0 py-1 space-y-2">
                      <h3 className="font-black truncate text-base leading-none group-hover:text-accent transition-colors" onClick={() => { router.push(`/series/${manga.id}`); closePanel(); }}>{manga.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{manga.description}</p>
                      <button onClick={() => removeBookmark(manga.id)} className="text-[9px] font-black text-accent uppercase tracking-widest flex items-center gap-2 hover:bg-accent hover:text-white px-3 py-1.5 rounded-lg border border-accent/20 transition-all">
                        <Trash2 className="w-3 h-3" /> DELETE FROM NODE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'appSettings':
        return (
          <div className="p-8 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
              <button onClick={() => openPanel('profile')} className="p-3 glass rounded-2xl">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-black tracking-tighter uppercase">SYSTEM PREFS</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-[#0f0f13] border border-white/5 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl"><Bell className="w-6 h-6 text-accent" /></div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest">Neural Notifications</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Instant chapter alerts</p>
                  </div>
                </div>
                <Switch checked={appSettings.notifications} onCheckedChange={(val) => updateAppSettings({ notifications: val })} />
              </div>

              <div className="flex items-center justify-between p-6 bg-[#0f0f13] border border-white/5 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl"><Cloud className="w-6 h-6 text-accent" /></div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest">Ultra Resolution</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Max bandwidth imagery</p>
                  </div>
                </div>
                <Switch checked={appSettings.highQualityImages} onCheckedChange={(val) => updateAppSettings({ highQualityImages: val })} />
              </div>

              <div className="flex items-center justify-between p-6 bg-[#0f0f13] border border-white/5 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl"><Shield className="w-6 h-6 text-accent" /></div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest">Stealth Mode</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Anonymous reading logs</p>
                  </div>
                </div>
                <Switch checked={appSettings.incognitoMode} onCheckedChange={(val) => updateAppSettings({ incognitoMode: val })} />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
               <button 
                onClick={() => { clearCache(); toast({ title: "Memory Wiped" }); closePanel(); }}
                className="w-full flex items-center justify-between p-6 bg-accent/5 border border-accent/20 rounded-2xl text-accent hover:bg-accent/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <Trash2 className="w-6 h-6" />
                  <span className="font-black uppercase tracking-widest text-sm">TOTAL DATABASE RESET</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'readerSettings':
        return (
          <div className="p-8 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <Settings className="w-8 h-8 text-accent" /> VISUAL ADAPTATION
            </h2>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Pulse Direction</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['vertical', 'ltr', 'rtl'] as const).map((dir) => (
                    <button
                      key={dir} onClick={() => updateReaderSettings({ direction: dir })}
                      className={cn(
                        "py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all",
                        readerSettings.direction === dir ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(153,27,27,0.4)]" : "bg-[#0f0f13] border-white/5 text-muted-foreground"
                      )}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Image Adaptation</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['fit', 'original', 'stretch'] as const).map((fit) => (
                    <button
                      key={fit} onClick={() => updateReaderSettings({ fitMode: fit })}
                      className={cn(
                        "py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all",
                        readerSettings.fitMode === fit ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(153,27,27,0.4)]" : "bg-[#0f0f13] border-white/5 text-muted-foreground"
                      )}
                    >
                      {fit === 'fit' ? 'FIT NODE' : fit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Atmospheric Matrix</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['dark', 'sepia', 'light'] as const).map((t) => (
                    <button
                      key={t} onClick={() => updateReaderSettings({ theme: t })}
                      className={cn(
                        "py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all",
                        readerSettings.theme === t ? "ring-2 ring-accent border-transparent" : "border-white/5",
                        t === 'dark' ? "bg-black text-white" : t === 'sepia' ? "bg-[#f4ecd8] text-[#5b4636]" : "bg-white text-black"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-[#0f0f13] border border-white/5 rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-black uppercase tracking-widest">Auto Pulse</label>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Automatic page advancement</p>
                  </div>
                  <Switch checked={readerSettings.autoScroll} onCheckedChange={(checked) => updateReaderSettings({ autoScroll: checked })} />
                </div>
                
                {readerSettings.autoScroll && (
                  <div className="space-y-4">
                    <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground tracking-widest">
                      <span>Low Intensity</span>
                      <span>Speed: {readerSettings.autoScrollSpeed}x</span>
                      <span>High Intensity</span>
                    </div>
                    <Slider value={[readerSettings.autoScrollSpeed]} min={0.5} max={5} step={0.5} onValueChange={([val]) => updateReaderSettings({ autoScrollSpeed: val })} />
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={closePanel}
              className="w-full py-5 bg-accent text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(153,27,27,0.4)] transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              COMMIT SETTINGS
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] animate-in fade-in duration-500" onClick={closePanel} />
      <div 
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[70] bg-[#050508] rounded-t-[2.5rem] border-t border-white/5 shadow-[0_-20px_60px_rgba(0,0,0,1)] animate-in slide-in-from-bottom duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-2xl mx-auto pb-safe-area-inset-bottom"
      >
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-4 mb-2" onClick={closePanel} />
        <div className="max-h-[85vh] overflow-hidden overflow-y-auto hide-scrollbar">
          {renderContent()}
        </div>
      </div>
    </>
  );
}