
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import { 
  X, Search, Bookmark, Grid, User, Trash2, Settings, ArrowRight, Check, 
  Camera, Save, ArrowLeft, Loader2, Bell, Shield, Cloud, LogIn, Mail, Lock
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

  // Firestore profile data
  const profileRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  // Edit Profile States
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Auth States
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
      if (file.size > 800000) { // Limit to ~800kb for Firestore safety
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 800KB.",
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
    if (!profileRef) {
      toast({
        title: "Account Required",
        description: "Please log in to save your profile to the cloud.",
      });
      return;
    }
    setSaving(true);
    try {
      await setDoc(profileRef, {
        displayName,
        bio,
        photoUrl,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast({
        title: "Profile Updated",
        description: "Your changes have been synced successfully.",
      });
      openPanel('profile');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not sync profile data.",
      });
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
        toast({ title: "Welcome!", description: "Account created successfully." });
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        toast({ title: "Welcome back!", description: "Logged in successfully." });
      }
      openPanel('profile');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Auth Failed",
        description: error.message,
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been signed out safely." });
      closePanel();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activePanel) {
      case 'editProfile':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <button onClick={() => openPanel('profile')} className="p-2 bg-white/5 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold">Edit Profile</h2>
            </div>

            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-accent/20 overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <User className="w-10 h-10 text-accent/50" />
                  )}
                </div>
                <button 
                  className="absolute bottom-0 right-0 p-2 bg-accent rounded-full shadow-lg border-2 border-background"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Tap camera to upload from gallery</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Your nickname..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bio</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-4 bg-primary text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-accent transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              SAVE CHANGES
            </button>
          </div>
        );

      case 'appSettings':
        return (
          <div className="p-6 space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => openPanel('profile')} className="p-2 bg-white/5 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold">App Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-bold">Push Notifications</p>
                    <p className="text-[10px] text-muted-foreground uppercase">New chapter alerts</p>
                  </div>
                </div>
                <Switch 
                  checked={appSettings.notifications} 
                  onCheckedChange={(val) => updateAppSettings({ notifications: val })} 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-bold">HD Images</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Higher bandwidth usage</p>
                  </div>
                </div>
                <Switch 
                  checked={appSettings.highQualityImages} 
                  onCheckedChange={(val) => updateAppSettings({ highQualityImages: val })} 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-bold">Incognito Mode</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Disable reading history</p>
                  </div>
                </div>
                <Switch 
                  checked={appSettings.incognitoMode} 
                  onCheckedChange={(val) => updateAppSettings({ incognitoMode: val })} 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
               <button 
                onClick={() => {
                  clearCache();
                  toast({ title: "Cache Cleared", description: "Local history and bookmarks removed." });
                  closePanel();
                }}
                className="w-full flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive hover:bg-destructive/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <span className="font-bold">Reset All Data</span>
                </div>
              </button>
            </div>
          </div>
        );

      case 'profile':
        if (!user) {
          return (
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-black tracking-tighter">JOIN NOIR</h2>
              <p className="text-sm text-muted-foreground">Log in to sync your bookmarks and customize your profile.</p>
              
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="email" 
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="Email Address" 
                      className="w-full bg-secondary/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Password" 
                      className="w-full bg-secondary/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={authLoading}
                  className="w-full py-4 bg-primary text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-accent transition-all disabled:opacity-50"
                >
                  {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  {isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}
                </button>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-accent transition-colors"
                >
                  {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="p-6 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-accent/30 text-accent font-bold text-2xl overflow-hidden">
                {profile?.photoUrl ? (
                  <img src={profile.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  profile?.displayName?.[0] || user.email?.[0] || 'U'
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold truncate">{profile?.displayName || 'Noir User'}</h2>
                <p className="text-xs text-accent uppercase tracking-widest font-black">Member</p>
              </div>
              <button 
                onClick={() => openPanel('editProfile')}
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {profile?.bio && (
              <p className="text-sm text-muted-foreground italic bg-white/5 p-4 rounded-xl border border-white/5">
                "{profile.bio}"
              </p>
            )}

            <div className="space-y-2">
              <button onClick={() => openPanel('editProfile')} className="w-full flex items-center justify-between p-4 bg-secondary/20 rounded-xl hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-accent" />
                  <span className="font-medium">Edit Profile</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>
              
              <button onClick={() => openPanel('appSettings')} className="w-full flex items-center justify-between p-4 bg-secondary/20 rounded-xl hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-accent" />
                  <span className="font-medium">App Settings</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 bg-secondary/20 rounded-xl hover:bg-destructive/10 group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="rotate-180 w-5 h-5 text-muted-foreground group-hover:text-destructive" />
                  <span className="font-medium group-hover:text-destructive">Log Out</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        );

      case 'readerSettings':
        return (
          <div className="p-6 space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent" /> Reader Settings
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reading Direction</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['vertical', 'ltr', 'rtl'] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => updateReaderSettings({ direction: dir })}
                      className={cn(
                        "py-2 text-xs font-bold uppercase rounded-lg border transition-all",
                        readerSettings.direction === dir ? "bg-accent border-accent text-white" : "bg-secondary/20 border-white/5 text-muted-foreground"
                      )}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Image Fit</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['fit', 'original', 'stretch'] as const).map((fit) => (
                    <button
                      key={fit}
                      onClick={() => updateReaderSettings({ fitMode: fit })}
                      className={cn(
                        "py-2 text-xs font-bold uppercase rounded-lg border transition-all",
                        readerSettings.fitMode === fit ? "bg-accent border-accent text-white" : "bg-secondary/20 border-white/5 text-muted-foreground"
                      )}
                    >
                      {fit === 'fit' ? 'Fit Width' : fit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reader Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'sepia', 'light'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateReaderSettings({ theme: t })}
                      className={cn(
                        "py-2 text-xs font-bold uppercase rounded-lg border transition-all",
                        readerSettings.theme === t ? "ring-2 ring-accent border-transparent" : "border-white/5",
                        t === 'dark' ? "bg-zinc-900 text-white" : t === 'sepia' ? "bg-[#f4ecd8] text-[#5b4636]" : "bg-white text-black"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-bold">Auto Scroll</label>
                    <p className="text-[10px] text-muted-foreground uppercase">Automatically scroll the pages</p>
                  </div>
                  <Switch 
                    checked={readerSettings.autoScroll} 
                    onCheckedChange={(checked) => updateReaderSettings({ autoScroll: checked })} 
                  />
                </div>
                
                {readerSettings.autoScroll && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                      <span>Slow</span>
                      <span>Speed: {readerSettings.autoScrollSpeed}x</span>
                      <span>Fast</span>
                    </div>
                    <Slider
                      value={[readerSettings.autoScrollSpeed]}
                      min={0.5}
                      max={5}
                      step={0.5}
                      onValueChange={([val]) => updateReaderSettings({ autoScrollSpeed: val })}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={closePanel}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 mt-4"
            >
              Apply Settings
            </button>
          </div>
        );

      case 'search':
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Search className="w-5 h-5 text-accent" /> Search Manga
            </h2>
            <div className="relative">
              <input 
                autoFocus
                type="text" 
                placeholder="Title, author, or genre..." 
                className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/search?q=${(e.target as HTMLInputElement).value}`);
                    closePanel();
                  }
                }}
              />
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Trending Now</p>
              <div className="flex flex-wrap gap-2">
                {['Solo Leveling', 'The Beginning After The End', 'Lookism', 'Tower of God'].map(t => (
                  <button key={t} onClick={() => { router.push(`/search?q=${t}`); closePanel(); }} className="px-4 py-2 bg-secondary/30 rounded-full border border-white/5 text-sm hover:bg-secondary transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'bookmark':
        return (
          <div className="p-6 space-y-6">
             <h2 className="text-xl font-bold flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-accent" /> My Library
            </h2>
            {bookmarks.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Bookmark className="w-8 h-8 text-muted-foreground opacity-30" />
                </div>
                <p className="text-muted-foreground">Your library is currently empty.</p>
                <button onClick={() => { router.push('/'); closePanel(); }} className="text-accent font-semibold hover:underline">Explore Manga</button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
                {bookmarks.map((manga) => (
                  <div key={manga.id} className="flex gap-4 p-3 bg-secondary/20 rounded-xl border border-white/5 group relative">
                    <img 
                      src={manga.coverUrl} 
                      alt={manga.title} 
                      className="w-16 h-24 object-cover rounded-md flex-shrink-0 cursor-pointer"
                      onClick={() => { router.push(`/series/${manga.id}`); closePanel(); }}
                    />
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-bold truncate text-sm mb-1 cursor-pointer" onClick={() => { router.push(`/series/${manga.id}`); closePanel(); }}>{manga.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{manga.description}</p>
                      <button onClick={() => removeBookmark(manga.id)} className="text-xs text-destructive flex items-center gap-1 hover:underline">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'genre':
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Grid className="w-5 h-5 text-accent" /> Explore Genres
            </h2>
            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
              {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Martial Arts', 'Romance', 'Sci-Fi', 'Thriller', 'System'].map(genre => (
                <button 
                  key={genre}
                  onClick={() => { router.push(`/search?genre=${genre}`); closePanel(); }}
                  className="p-4 text-center bg-secondary/20 rounded-xl border border-white/5 hover:bg-primary/20 hover:border-accent/30 transition-all font-medium"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300" 
        onClick={closePanel}
      />
      <div 
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[70] glass rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-2xl mx-auto pb-safe-area-inset-bottom"
      >
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-3" onClick={closePanel} />
        <div className="max-h-[85vh] overflow-hidden overflow-y-auto hide-scrollbar">
          {renderContent()}
        </div>
      </div>
    </>
  );
}
