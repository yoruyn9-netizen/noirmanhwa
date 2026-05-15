"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Loader2, Fingerprint, Mail, Lock, ShieldAlert, Terminal, ArrowRight } from 'lucide-react';
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
    <div className="min-h-[85vh] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-40" />

      <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="relative inline-block group">
            <div className="w-24 h-24 bg-accent/5 rounded-[2.5rem] border border-accent/20 flex items-center justify-center mx-auto shadow-2xl group-hover:scale-105 transition-transform duration-700">
               <Fingerprint className="w-12 h-12 text-accent group-hover:text-white transition-colors duration-500" />
            </div>
            {/* Pulsing element */}
            <div className="absolute inset-0 bg-accent/10 rounded-[2.5rem] blur-xl -z-10 animate-pulse" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-glow">System Access</h1>
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] opacity-80">Synchronization Protocol Required</p>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-[inherit]" />
          
          <div className="space-y-6 relative z-10">
            {!isAdminMode ? (
              <button
                onClick={loginWithGoogle}
                disabled={isLoading}
                className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-accent hover:text-white transition-all duration-500 text-[11px] uppercase tracking-[0.2em] shadow-xl group/btn active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4 animate-in slide-in-from-top-2 duration-500">
                <div className="space-y-3">
                  <div className="relative group/input">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within/input:text-accent transition-colors" />
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="EMAIL ADDRESS" 
                      className="w-full bg-[#050508] border border-white/5 rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-black text-[10px] tracking-widest placeholder:text-neutral-800"
                    />
                  </div>
                  <div className="relative group/input">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within/input:text-accent transition-colors" />
                    <input 
                      type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="PASSWORD" 
                      className="w-full bg-[#050508] border border-white/5 rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 font-black text-[10px] tracking-widest placeholder:text-neutral-800"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full py-5 bg-red-600/10 text-red-500 border border-red-600/20 font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all text-[10px] tracking-widest shadow-xl active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Terminal className="w-4 h-4" /> ADMIN LOGIN</>}
                </button>
              </form>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-600/5 border border-red-600/10 rounded-2xl flex items-center gap-4 animate-in shake duration-500">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-relaxed">
                  {error}
                </p>
              </div>
            )}
            
            {/* Protocol Switcher */}
            <div className="pt-6 border-t border-white/5">
              <button 
                onClick={() => setIsAdminMode(!isAdminMode)} 
                className="w-full text-[8px] font-black text-neutral-600 uppercase tracking-widest hover:text-accent transition-colors flex items-center justify-center gap-2"
              >
                {isAdminMode ? 'Standard Login Mode' : 'Elevate Permissions'}
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-[7px] font-bold text-neutral-700 uppercase tracking-[0.6em] opacity-40">NoirManhwa Secure Access Terminal • v2.0.4</p>
        </div>
      </div>
    </div>
  );
}
