
"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Loader2, Fingerprint, Mail, Lock, ShieldAlert, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { user, loginWithGoogle, loginAsAdmin, isLoading, error } = useAuthStore();
  const router = useRouter();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) router.push('/profile');
  }, [user, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginAsAdmin(email, password);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] border border-accent/20 flex items-center justify-center mx-auto shadow-2xl">
             <Fingerprint className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-glow">Sign In</h1>
        </div>

        <div className="space-y-6">
          {!isAdminMode ? (
            <button
              onClick={loginWithGoogle}
              disabled={isLoading}
              className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-accent hover:text-white transition-all text-[11px] uppercase tracking-[0.2em]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue with Google"}
            </button>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-[#0a0a0f] border border-white/5 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-accent/40 font-black text-[10px] tracking-widest"
              />
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD" 
                className="w-full bg-[#0a0a0f] border border-white/5 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-accent/40 font-black text-[10px] tracking-widest"
              />
              <button type="submit" disabled={isLoading} className="w-full py-5 bg-red-600/10 text-red-500 border border-red-600/20 font-black rounded-2xl">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ADMIN LOGIN"}
              </button>
            </form>
          )}
          
          <button onClick={() => setIsAdminMode(!isAdminMode)} className="w-full text-[8px] font-black text-neutral-600 uppercase tracking-widest">
            {isAdminMode ? 'Back to Google' : 'Admin Access'}
          </button>

          {error && <p className="text-center text-[10px] font-black text-red-500 uppercase">{error}</p>}
        </div>
      </div>
    </div>
  );
}
