
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  subscribeToReports, 
  resolveReport 
} from '@/lib/firestore';
import { Report } from '@/types/report';
import { 
  AlertTriangle, 
  Bug, 
  FileWarning, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  Loader2,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ReportDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToReports((data) => {
      setReports(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await resolveReport(id);
      toast({ title: "Signal Resolved", description: "Log entry marked as processed." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not resolve log." });
    }
  };

  const filtered = reports.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0a0a0f]/60 border border-white/5 rounded-2xl w-fit">
        {(['pending', 'resolved', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
              filter === f ? "bg-accent text-white shadow-xl shadow-accent/20" : "text-neutral-500 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-[9px] font-black uppercase tracking-widest">Analyzing Anomaly Logs</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center space-y-4 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
          <CheckCircle2 className="w-10 h-10 text-green-500/20 mx-auto" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-600">No anomalies detected in this sector.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((report) => (
            <motion.div
              layout
              key={report.id}
              className={cn(
                "p-8 rounded-[2.5rem] border transition-all duration-500 group",
                report.status === 'pending' ? "bg-[#0a0a0f] border-red-500/20" : "bg-black border-white/5 opacity-60"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border",
                    report.type === 'bug' ? "bg-red-500/10 border-red-500/20" : "bg-accent/10 border-accent/20"
                  )}>
                    {report.type === 'bug' ? <Bug className="w-6 h-6 text-red-500" /> : <FileWarning className="w-6 h-6 text-accent" />}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em]",
                        report.type === 'bug' ? "text-red-500" : "text-accent"
                      )}>
                        {report.type === 'bug' ? 'SYSTEM ANOMALY' : 'CHAPTER DATA ERROR'}
                      </span>
                      <span className="text-[7px] font-black text-neutral-700 uppercase">
                        {report.timestamp?.toDate ? formatDistanceToNow(report.timestamp.toDate(), { addSuffix: true }) : 'recent'}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{report.userEmail}</h4>
                    
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-medium bg-black/40 p-4 rounded-2xl border border-white/5">
                      {report.description}
                    </p>

                    {report.chapterId && (
                      <Link 
                        href={`/reader/${report.chapterId}`}
                        className="inline-flex items-center gap-2 text-[8px] font-black text-accent uppercase tracking-widest hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> View Target Chapter
                      </Link>
                    )}
                  </div>
                </div>

                {report.status === 'pending' && (
                  <button
                    onClick={() => handleResolve(report.id)}
                    className="sm:self-center px-10 py-4 bg-white text-black font-black rounded-2xl text-[9px] uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-xl active:scale-95"
                  >
                    MARK RESOLVED
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
