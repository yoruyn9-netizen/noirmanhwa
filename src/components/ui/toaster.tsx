
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { motion, AnimatePresence } from 'framer-motion'
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant?: string) => {
    switch (variant) {
      case 'destructive': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <CheckCircle2 className="w-5 h-5 text-accent" />;
    }
  }

  return (
    <ToastProvider>
      <AnimatePresence>
        {toasts.map(function ({ id, title, description, variant, action, ...props }) {
          return (
            <Toast key={id} {...props} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-6"
              >
                <div className="shrink-0 p-3 bg-white/5 rounded-xl border border-white/5">
                  {getIcon(variant)}
                </div>
                <div className="grid gap-1.5 flex-1 min-w-0">
                  {title && <ToastTitle className="text-[12px] font-black uppercase tracking-tight text-white">{title}</ToastTitle>}
                  {description && (
                    <ToastDescription className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-relaxed">
                      {description}
                    </ToastDescription>
                  )}
                </div>
                <div className="pl-4">
                   <ToastClose className="p-2 hover:bg-white/5 rounded-lg text-neutral-600 hover:text-white transition-colors" />
                </div>
              </motion.div>
              {action}
            </Toast>
          )
        })}
      </AnimatePresence>
      <ToastViewport className="fixed top-0 left-1/2 -translate-x-1/2 flex flex-col p-6 gap-3 w-full max-w-[420px] pointer-events-none z-[999]" />
    </ToastProvider>
  )
}
