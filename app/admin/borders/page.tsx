
"use client";

import React, { useState, useRef, useEffect } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { ImagePlus, Loader2, Trash2, ArrowLeft, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

const { db } = initializeFirebase();

function BorderAdminPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [tier, setTier] = useState('premium');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [borders, setBorders] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'borders'), (snap) => {
      setBorders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !name) {
      if (!name) toast({ variant: "destructive", title: "Missing Identity", description: "Border signature required." });
      return;
    }

    setIsUploading(true);
    setProgress(20);
    try {
      const url = await uploadToCloudinary(file, 'borders');
      setProgress(80);
      
      await addDoc(collection(db, 'borders'), {
        name,
        url,
        tier,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });
      
      toast({ title: "Fabrication Complete", description: `Border Node ${name} added to repository.` });
      setName('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast({ variant: "destructive", title: "Uplink Failed", description: "Cloudinary refused transmission." });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently decommission this border node?')) return;
    try {
      await deleteDoc(doc(db, 'borders', id));
      toast({ title: "Node Purged", description: "Border removed from grid." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to purge node." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000 px-4">
      <header className="flex items-center justify-between pt-6">
        <Link href="/admin" className="p-3 bg-[#0a0a0f] border border-white/5 rounded-2xl hover:bg-neutral-900 transition-all">
          <ArrowLeft className="w-5 h-5 text-neutral-500" />
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <ImagePlus className="w-6 h-6 text-accent" /> Border Fabrication
          </h1>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Advanced Visual Identity Hub</p>
        </div>
        <div className="w-11" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Terminal */}
        <div className="p-8 bg-[#0a0a0f]/60 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl h-fit">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Create New Node
            </h3>
            <p className="text-[8px] text-neutral-500 uppercase tracking-widest">Greenscreen PNG (transparent center)</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-accent ml-2">Border Signature</label>
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 font-bold text-[11px] uppercase"
                placeholder="LEGENDARY VANGUARD..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-accent ml-2">Tier Authorization</label>
              <select 
                value={tier} onChange={(e) => setTier(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none font-bold text-[11px] outline-none"
              >
                <option value="owner">SUPREME OWNER</option>
                <option value="admin">SYSTEM MODERATOR</option>
                <option value="premium">PREMIUM NODE</option>
                <option value="event">SPECIAL EVENT</option>
                <option value="user">VERIFIED USER</option>
              </select>
            </div>

            <div className="relative">
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />
              <button 
                onClick={() => fileRef.current?.click()}
                disabled={isUploading || !name}
                className="w-full py-12 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:border-accent/40 transition-all group disabled:opacity-20 bg-black/20"
              >
                {isUploading ? (
                  <div className="w-full max-w-[200px] space-y-4">
                     <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
                     <Progress value={progress} className="h-1 bg-white/5" />
                     <p className="text-[8px] font-black text-center text-accent uppercase">TRANSMITTING...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-neutral-800 group-hover:text-accent transition-colors" />
                    <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em]">SELECT SOURCE IMAGE</p>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Existing Borders Grid */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-neutral-500 ml-4">Active Repository</h3>
          <div className="grid grid-cols-2 gap-4">
            {borders.map((b) => (
              <div key={b.id} className="p-4 bg-white/5 rounded-[2.5rem] border border-white/5 relative group overflow-hidden">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-20 h-20 relative flex items-center justify-center">
                    <img src={b.url} className="absolute inset-0 w-full h-full object-contain z-20 scale-[1.3]" alt="" />
                    <div className="w-12 h-12 rounded-full bg-neutral-900 overflow-hidden relative z-10">
                      <div className="bg-accent/20 w-full h-full" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-white truncate w-24">{b.name}</p>
                    <p className="text-[7px] font-bold text-accent uppercase">{b.tier}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(b.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequireAuth(BorderAdminPage, { ownerOnly: true });
