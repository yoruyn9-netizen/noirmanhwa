
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
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant?: string) => {
    const iconProps = "w-5 h-5";
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className={cn(iconProps, "text-red-400")} />;
      case 'info':
        return <Info className={cn(iconProps, "text-blue-400")} />;
      default:
        return <CheckCircle2 className={cn(iconProps, "text-accent")} />;
    }
  };

  const getStyles = (variant?: string) => {
    switch (variant) {
      case 'destructive':
        return {
          bgClass: 'bg-red-500/10',
          borderClass: 'border-red-500/30',
          shadowClass: 'shadow-red-500/20',
          glowClass: 'from-red-500/20'
        };
      case 'info':
        return {
          bgClass: 'bg-blue-500/10',
          borderClass: 'border-blue-500/30',
          shadowClass: 'shadow-blue-500/20',
          glowClass: 'from-blue-500/20'
        };
      default:
        return {
          bgClass: 'bg-accent/10',
          borderClass: 'border-accent/30',
          shadowClass: 'shadow-accent/20',
          glowClass: 'from-accent/20'
        };
    }
  };

  return (
    <ToastProvider>
      <AnimatePresence mode="popLayout">
        {toasts.map(function ({ id, title, description, variant, action, ...props }, index) {
          const styles = getStyles(variant);
          
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: -20, scale: 0.95, x: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: index * 0.05
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[400px]"
              style={{
                marginTop: `${index * 90 + 20}px`
              }}
            >
              <Toast 
                {...props}
                className={cn(
                  "group relative bg-white/[0.05] backdrop-blur-2xl rounded-2xl p-4 pr-12",
                  styles.bgClass,
                  "border", styles.borderClass,
                  "shadow-lg", styles.shadowClass,
                  "overflow-hidden"
                )}
              >
                {/* Animated border gradient pseudo-element */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl pointer-events-none",
                  "bg-gradient-to-r", styles.glowClass, "to-transparent opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-300"
                )} />

                {/* Glow background */}
                <div className={cn(
                  "absolute -inset-0.5 rounded-2xl blur-xl pointer-events-none opacity-0 group-hover:opacity-50",
                  "bg-gradient-to-r", styles.glowClass, "to-transparent",
                  "transition-opacity duration-300 -z-10"
                )} />

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-3 relative z-10"
                >
                  {/* Icon */}
                  <motion.div 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={cn(
                      "shrink-0 p-2.5 rounded-xl",
                      "border border-current/20 bg-current/10",
                      "flex items-center justify-center mt-0.5"
                    )}
                  >
                    {getIcon(variant)}
                  </motion.div>

                  {/* Content */}
                  <div className="grid gap-1 flex-1 min-w-0">
                    {title && (
                      <ToastTitle className="text-[12px] font-black uppercase tracking-tight text-white/90">
                        {title}
                      </ToastTitle>
                    )}
                    {description && (
                      <ToastDescription className="text-[10px] font-medium text-white/60 uppercase tracking-widest leading-relaxed">
                        {description}
                      </ToastDescription>
                    )}
                  </div>

                  {/* Close Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="pl-2"
                  >
                    <ToastClose className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white/70 transition-all duration-200 shrink-0" />
                  </motion.div>
                </motion.div>

                {action && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-3 ml-11"
                  >
                    {action}
                  </motion.div>
                )}
              </Toast>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Custom Viewport */}
      <ToastViewport className="fixed top-0 left-0 right-0 flex justify-center pointer-events-none z-[999] pt-5" />
    </ToastProvider>
  )
}
