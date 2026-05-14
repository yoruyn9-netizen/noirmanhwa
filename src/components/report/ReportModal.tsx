
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Bug, 
  FileWarning, 
  X, 
  Send,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { submitReport } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId?: string;
}

export default function ReportModal({ isOpen, onClose, chapterId }: ReportModalProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [type, setType] = useState<'bug' | 'chapter'>('bug');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await submitReport({
        userId: user.uid,
        userEmail: user.email || 'anonymous',
        type,
        chapterId,
        description
      });
      
      setIsSuccess(true);
      toast({ title: "Log Transmitted", description: "Report recorded in master database." });
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setDescription('');
      }, 2000);
    } catch (err) {
      toast({ variant: "destructive", title: "Transmission Failed", description: "Could not record report log." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          onClick={onClose} 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-accent to-red-500 animate-pulse" />
          
          <div className="p-10 space-y-10">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-tighter text-glow flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" /> Error Log
                </h2>
                <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">Reporting system anomalies</p>
              </div>
              <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </header>

            {isSuccess ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in">
                <div className="w-20 h-20 bg-green-500/10 rounded-[2.5rem] border border-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-tight">Transmission Verified</h3>
                  <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Master Node notified</p>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'bug', label: 'SYSTEM BUG', icon: Bug },
                    { id: 'chapter', label: 'DATA ERROR', icon: FileWarning },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setType(opt.id as any)}
                      className={cn(
                        "p-6 rounded-3xl border transition-all duration-500 flex flex-col items-center gap-4 text-center",
                        type === opt.id 
                          ? "bg-red-500/10 border-red-500/40 text-red-500 shadow-xl shadow-red-500/5" 
                          : "bg-white/5 border-white/5 text-neutral-600 grayscale hover:grayscale-0"
                      )}
                    >
                      <opt.icon className="w-6 h-6" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 ml-4">Anomaly Details</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the detection..."
                    className="w-full h-40 bg-[#050508] border border-white/5 rounded-[2rem] p-6 focus:outline-none focus:ring-1 focus:ring-red-500/40 text-[11px] font-medium resize-none placeholder:text-neutral-800"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !description.trim()}
                  className="w-full py-5 bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-red-600/20 hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                  SUBMIT ERROR LOG
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
