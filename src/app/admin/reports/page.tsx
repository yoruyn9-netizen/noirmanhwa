
"use client";

import React from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import ReportDashboard from '@/components/owner/ReportDashboard';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ReportsAdminPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000">
      <header className="flex items-center justify-between">
        <Link href="/profile" className="p-3 bg-[#0a0a0f] border border-white/5 rounded-2xl hover:bg-neutral-900 transition-all">
          <ArrowLeft className="w-5 h-5 text-neutral-500" />
        </Link>
        <div className="text-center space-y-1">
          <h1 className="text-xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Anomaly Control
          </h1>
          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Master Node Monitoring Terminal</p>
        </div>
        <div className="w-11" />
      </header>

      <ReportDashboard />
    </div>
  );
}

export default RequireAuth(ReportsAdminPage, { ownerOnly: true });
