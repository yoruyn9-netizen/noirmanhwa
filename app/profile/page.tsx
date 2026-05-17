"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { handleLoginStreak } from '@/lib/streaks';
import type { UserProfile } from '@/types/user';
import { initializeFirebase } from '@/firebase/config';
import { doc, onSnapshot } from "firebase/firestore";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from '@/components/ui/skeleton';

import DailyLoginModal from '@/components/profile/DailyLoginModal';
import ProfileEditor from '@/components/profile/ProfileEditor';
import UserBadge from '@/components/profile/UserBadge';
import StreakCounter from '@/components/profile/StreakCounter';
import MilestoneProgress from '@/components/profile/MilestoneProgress';

const { db } = initializeFirebase();

export default function ProfilePage() {
  const { user: authUser, setUser, logout } = useAuthStore();
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(doc(db, "users", authUser.uid), async (docSnap) => {
      try {
        if (docSnap.exists()) {
          const userProfileData = docSnap.data() as UserProfile;
          
          // handleLoginStreak should be idempotent to prevent loops.
          // It checks and updates the user's streak in Firestore if necessary.
          const streakUpdates = await handleLoginStreak({ ...authUser, ...userProfileData });

          // Show reward modal only when the streak has just been updated.
          if (streakUpdates.loginStreak > (userProfileData.loginStreak || 0)) {
            setShowDailyReward(true);
          }

          // Combine all user data sources and update the global store.
          const fullProfile: UserProfile = { 
            ...authUser, 
            ...userProfileData, 
            ...streakUpdates 
          };
          
          setUser(fullProfile);
        } else {
          console.error("User profile document not found in Firestore.");
        }
      } catch (error) {
        console.error("Error processing user profile:", error);
      } finally {
        // This ensures the skeleton loader is removed even if errors occur.
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching user profile from Firestore:", error);
      setLoading(false);
    });

    // Cleanup subscription on component unmount.
    return () => unsub();
  }, [authUser?.uid, setUser]);

  const user = useAuthStore(state => state.user);

  if (loading) {
    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-64" />
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
            </div>
        </div>
    );
  }

  if (!user) {
    return <div className="container mx-auto p-4 text-center">Please log in to view your profile.</div>;
  }
  
  const nextMilestone = [3, 7, 14, 30, 100].find(m => m > (user.loginStreak || 0)) || 100;
  const emailParts = user.email?.split('@');
  const maskedEmail = emailParts ? `${emailParts[0].substring(0, 3)}...@${emailParts[1]}`: 'No email';

  return (
    <div className="container mx-auto p-4">
        {showDailyReward && (
            <DailyLoginModal 
                isOpen={showDailyReward} 
                onClose={() => setShowDailyReward(false)} 
                streak={user.loginStreak || 0} 
            />
        )}
        
        {isEditing && (
            <ProfileEditor
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                user={user}
            />
        )}

      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-32 h-32 border-4 border-primary">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
          <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex items-center">
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <UserBadge role={user.role || 'User'} streak={user.loginStreak || 0} />
        </div>
        <p className="text-muted-foreground">@{user.username || user.displayName?.toLowerCase().replace(/\s/g, '')}</p>
        <p className="text-muted-foreground">{maskedEmail}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Stats</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span>Total Reads</span><span className="font-bold">{user.stats?.totalReads || 0}</span></div>
            <div className="flex justify-between"><span>Bookmarks</span><span className="font-bold">{user.stats?.bookmarks || 0}</span></div>
            <div className="flex justify-between"><span>Comments</span><span className="font-bold">{user.stats?.comments || 0}</span></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Login Streak</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
                 <StreakCounter streak={user.loginStreak || 0} />
                 <div className="w-full mt-4">
                    <MilestoneProgress 
                        currentStreak={user.loginStreak || 0}
                        nextMilestone={nextMilestone}
                        milestoneName={`Day ${nextMilestone} Badge`}
                    />
                 </div>
            </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="theme-switch" className="pr-4">Dark Mode</label>
              <Switch id="theme-switch" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="notification-switch" className="pr-4">Push Notifications</label>
              <Switch id="notification-switch" />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            <Button variant="destructive" className="flex-1" onClick={logout}>Logout</Button>
        </div>
      </div>
    </div>
  );
}
