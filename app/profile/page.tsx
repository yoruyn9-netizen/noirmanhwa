"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { handleLoginStreak } from '@/lib/streaks';
import { UserProfile } from '@/types/user';
import StreakCounter from '@/components/profile/StreakCounter';
import MilestoneProgress from '@/components/profile/MilestoneProgress';
import BadgeDisplay from '@/components/ui/BadgeDisplay';
import DailyLoginModal from '@/components/profile/DailyLoginModal';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (user) {
      handleLoginStreak(user).then(updates => {
        setUser({ ...user, ...updates });
      });

      const lastClaim = user.lastClaimDate ? new Date(user.lastClaimDate as any).toDateString() : null;
      const today = new Date().toDateString();
      if (lastClaim !== today) {
        setShowLoginModal(true);
      }
    }
  }, [user, setUser]);

  if (!user) {
    return <div>Loading...</div>; // Or a proper loading state
  }

  const nextMilestone = [3, 7, 14, 30, 100].find(m => m > (user.loginStreak || 0)) || 100;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{user.displayName}'s Profile</h1>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Login Streak</h2>
          <StreakCounter streak={user.loginStreak || 0} />
          <div className="mt-4">
            <MilestoneProgress 
              currentStreak={user.loginStreak || 0}
              nextMilestone={nextMilestone}
              milestoneName={`Day ${nextMilestone} Badge`}
            />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Badges</h2>
          <div className="flex flex-wrap gap-4">
            {user.badges?.map(badgeId => (
              <BadgeDisplay key={badgeId} badgeId={badgeId} size="lg" />
            ))}
          </div>
        </div>
      </div>

      {showLoginModal && 
        <DailyLoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          streak={user.loginStreak || 0} 
        />
      }
    </div>
  );
}
