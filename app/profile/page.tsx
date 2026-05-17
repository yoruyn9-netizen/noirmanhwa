
"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { handleLoginStreak } from '@/lib/streaks';
import { UserProfile } from '@/types/user';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, User, Star, Crown } from "lucide-react";


import StreakCounter from '@/components/profile/StreakCounter';
import MilestoneProgress from '@/components/profile/MilestoneProgress';
import DailyLoginModal from '@/components/profile/DailyLoginModal';
import ProfileEditor from '@/components/profile/ProfileEditor';
import { Skeleton } from '@/components/ui/skeleton';

// Mock UserBadge component for now
const UserBadge = ({ role, streak }: { role: string; streak: number }) => {
  const getBadge = () => {
    if (role === 'Owner') return <Crown className="w-5 h-5 text-yellow-400" />;
    if (role === 'Admin') return <ShieldCheck className="w-5 h-5 text-blue-500" />;
    if (role === 'Premium') return <Star className="w-5 h-5 text-purple-500" />;
    if (streak >= 30) return <span className="text-lg">🔥</span>;
    return <User className="w-5 h-5 text-gray-400" />;
  };

  return <div className="ml-2">{getBadge()}</div>;
};


export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processUser = async () => {
      if (user) {
        setLoading(true);
        const updates = await handleLoginStreak(user);
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);

        const lastClaim = updatedUser.lastClaimDate ? new Date(updatedUser.lastClaimDate as any).toDateString() : null;
        const today = new Date().toDateString();

        if (lastClaim !== today) {
          setShowDailyReward(true);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    processUser();
  }, [user?.uid]);


  if (loading) {
    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-64" />
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                    <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                    <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                </Card>
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                    <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                </Card>
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                    <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                </Card>
            </div>
        </div>
    )
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
        <p className="text-muted-foreground">@{user.username || user.displayName?.toLowerCase()}</p>
        <p className="text-muted-foreground">{maskedEmail}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span>Total Reads</span><span className="font-bold">{user.stats?.totalReads || 0}</span></div>
            <div className="flex justify-between"><span>Bookmarks</span><span className="font-bold">{user.stats?.bookmarks || 0}</span></div>
            <div className="flex justify-between"><span>Comments</span><span className="font-bold">{user.stats?.comments || 0}</span></div>
          </CardContent>
        </Card>

        {/* Login Streak Section */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Login Streak</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
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

        {/* Settings Section */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="theme-switch">Dark Mode</label>
              <Switch id="theme-switch" />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="notification-switch">Push Notifications</label>
              <Switch id="notification-switch" />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <div className="lg:col-span-3 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            <Button variant="destructive" className="flex-1" onClick={logout}>Logout</Button>
        </div>
      </div>
    </div>
  );
}
