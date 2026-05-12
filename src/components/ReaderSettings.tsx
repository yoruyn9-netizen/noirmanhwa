
'use client';

import React from 'react';
import { ReaderPrefs } from '@/lib/reader-utils';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Maximize, 
  MoveVertical, 
  MoveHorizontal, 
  Zap, 
  Sun, 
  Moon, 
  Coffee 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface ReaderSettingsProps {
  prefs: ReaderPrefs;
  onChange: (prefs: ReaderPrefs) => void;
}

export default function ReaderSettings({ prefs, onChange }: ReaderSettingsProps) {
  const update = (patch: Partial<ReaderPrefs>) => {
    onChange({ ...prefs, ...patch });
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tighter uppercase text-glow flex items-center gap-3">
          <Settings className="w-5 h-5 text-accent" /> Neural Adaptation
        </h2>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Configure sensory input parameters</p>
      </div>

      <div className="space-y-8">
        {/* Direction */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-accent/60">Reading Vector</label>
          <div className="grid grid-cols-3 gap-2">
            {(['vertical', 'ltr', 'rtl'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => update({ direction: dir })}
                className={cn(
                  "py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                  prefs.direction === dir 
                    ? "bg-accent border-accent text-white shadow-xl shadow-accent/20" 
                    : "bg-[#0a0a0f] border-white/5 text-muted-foreground"
                )}
              >
                {dir === 'vertical' ? <MoveVertical className="w-4 h-4 mx-auto mb-1" /> : <MoveHorizontal className="w-4 h-4 mx-auto mb-1" />}
                {dir}
              </button>
            ))}
          </div>
        </div>

        {/* Fit Mode */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-accent/60">Frame Adaptation</label>
          <div className="grid grid-cols-3 gap-2">
            {(['fit', 'original', 'stretch'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => update({ fitMode: mode })}
                className={cn(
                  "py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                  prefs.fitMode === mode 
                    ? "bg-accent border-accent text-white shadow-xl shadow-accent/20" 
                    : "bg-[#0a0a0f] border-white/5 text-muted-foreground"
                )}
              >
                <Maximize className="w-4 h-4 mx-auto mb-1" />
                {mode === 'fit' ? 'Contain' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-accent/60">Atmospheric Matrix</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'dark', icon: Moon, bg: 'bg-black' },
              { id: 'sepia', icon: Coffee, bg: 'bg-[#1a1a14]' },
              { id: 'light', icon: Sun, bg: 'bg-white text-black' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => update({ theme: t.id as any })}
                className={cn(
                  "py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center",
                  prefs.theme === t.id 
                    ? "ring-2 ring-accent border-transparent" 
                    : "border-white/5",
                  t.bg
                )}
              >
                <t.icon className="w-4 h-4 mb-1" />
                {t.id}
              </button>
            ))}
          </div>
        </div>

        {/* Auto Scroll */}
        <div className="p-6 bg-[#0a0a0f] border border-white/5 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-accent" /> Auto Pulse
              </label>
              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Spectral page advancement</p>
            </div>
            <Switch 
              checked={prefs.autoScroll} 
              onCheckedChange={(val) => update({ autoScroll: val })}
            />
          </div>
          
          {prefs.autoScroll && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center text-[9px] font-black uppercase text-muted-foreground tracking-widest">
                <span>Velocity</span>
                <span className="text-accent">{prefs.autoScrollSpeed}x</span>
              </div>
              <Slider 
                value={[prefs.autoScrollSpeed]} 
                min={0.5} 
                max={5} 
                step={0.5} 
                onValueChange={([val]) => update({ autoScrollSpeed: val })} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
