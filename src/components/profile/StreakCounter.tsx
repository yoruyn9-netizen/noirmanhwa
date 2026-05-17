"use client";

import React from 'react';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="flex items-center justify-center gap-4 bg-gray-900/50 border border-white/10 rounded-2xl p-6">
      <Flame className="w-12 h-12 text-orange-400" />
      <div className="text-center">
        <p className="text-5xl font-black text-white">{streak}</p>
        <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">Day Streak</p>
      </div>
    </div>
  );
}
