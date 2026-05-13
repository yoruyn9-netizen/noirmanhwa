
"use client";

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';

interface RequireAuthOptions {
  ownerOnly?: boolean;
}

export default function RequireAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: RequireAuthOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, checkAuth } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      checkAuth();
    }, [checkAuth]);

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/login');
      }
      
      if (!isLoading && user && options.ownerOnly && user.role !== 'owner') {
        router.push('/');
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <div className="absolute inset-0 blur-2xl bg-accent/20 animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Synchronizing Identity</p>
        </div>
      );
    }

    if (!user) return null;

    if (options.ownerOnly && user.role !== 'owner') {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
          <ShieldAlert className="w-12 h-12 text-destructive" />
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-tighter text-glow">Access Denied</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">High-level clearance required</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
