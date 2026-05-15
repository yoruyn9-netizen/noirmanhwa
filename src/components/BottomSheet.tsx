
"use client";

import React, { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import { 
  Settings
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export default function BottomSheet() {
  const { 
    activePanel, isOpen, closePanel, readerSettings, updateReaderSettings
  } = useUIStore();
  
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen || activePanel !== 'readerSettings') return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] animate-in fade-in duration-500" onClick={closePanel} />
      <div 
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[70] bg-[#050508] rounded-t-[2.5rem] border-t border-white/5 shadow-[0_-20px_60px_rgba(0,0,0,1)] animate-in slide-in-from-bottom duration-700 max-w-2xl mx-auto pb-safe-area-inset-bottom"
      >
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-4 mb-2" onClick={closePanel} />
        
        <div className="p-8 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Settings className="w-8 h-8 text-accent" /> READER SETTINGS
          </h2>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Scroll Direction</label>
              <div className="grid grid-cols-3 gap-3">
                {(['vertical', 'ltr', 'rtl'] as const).map((dir) => (
                  <button
                    key={dir} onClick={() => updateReaderSettings({ direction: dir })}
                    className={cn(
                      "py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all",
                      readerSettings.direction === dir ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]" : "bg-[#0f0f13] border-white/5 text-muted-foreground"
                    )}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Fit Mode</label>
              <div className="grid grid-cols-3 gap-3">
                {(['fit', 'original', 'stretch'] as const).map((fit) => (
                  <button
                    key={fit} onClick={() => updateReaderSettings({ fitMode: fit })}
                    className={cn(
                      "py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all",
                      readerSettings.fitMode === fit ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]" : "bg-[#0f0f13] border-white/5 text-muted-foreground"
                    )}
                  >
                    {fit === 'fit' ? 'FIT' : fit}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {(['dark', 'sepia', 'light'] as const).map((t) => (
                  <button
                    key={t} onClick={() => updateReaderSettings({ theme: t })}
                    className={cn(
                      "py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all",
                      readerSettings.theme === t ? "ring-2 ring-accent border-transparent" : "border-white/5",
                      t === 'dark' ? "bg-black text-white" : t === 'sepia' ? "bg-[#f4ecd8] text-[#5b4636]" : "bg-white text-black"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-[#0f0f13] border border-white/5 rounded-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-black uppercase tracking-widest">Auto Scroll</label>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Automatic page advancement</p>
                </div>
                <Switch checked={readerSettings.autoScroll} onCheckedChange={(checked) => updateReaderSettings({ autoScroll: checked })} />
              </div>
              
              {readerSettings.autoScroll && (
                <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground tracking-widest">
                    <span>Speed</span>
                    <span>{readerSettings.autoScrollSpeed}x</span>
                  </div>
                  <Slider value={[readerSettings.autoScrollSpeed]} min={0.5} max={5} step={0.5} onValueChange={([val]) => updateReaderSettings({ autoScrollSpeed: val })} />
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={closePanel}
            className="w-full py-5 bg-accent text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(139,92,246,0.4)] transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            SAVE SETTINGS
          </button>
        </div>
      </div>
    </>
  );
}
