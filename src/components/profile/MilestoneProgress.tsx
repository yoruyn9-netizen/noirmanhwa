"use client";

import React from 'react';

interface MilestoneProgressProps {
  currentStreak: number;
  nextMilestone: number;
  milestoneName: string;
}

export default function MilestoneProgress({ currentStreak, nextMilestone, milestoneName }: MilestoneProgressProps) {
  const progress = Math.min((currentStreak / nextMilestone) * 100, 100);

  return (
    <div className="w-full bg-gray-800 rounded-full h-2.5">
        <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
        ></div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Progress to {milestoneName}</span>
            <span>{currentStreak} / {nextMilestone} days</span>
        </div>
    </div>
  );
}
