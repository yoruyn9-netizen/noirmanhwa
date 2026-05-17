
"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The auth store might take a moment to initialize the user state.
    // We'll show a loader until the user state is determined.
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-24 w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="container mx-auto p-4 text-center">
            <p>Please log in to view your profile.</p>
        </div>
    );
  }
  
  const emailParts = user.email?.split('@');
  const maskedEmail = emailParts ? `${emailParts[0].substring(0, 3)}...@${emailParts[1]}`: 'No email provided';

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center space-y-4 mb-8">
        <Avatar className="w-32 h-32 border-4 border-primary">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
          <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold">{user.displayName || 'Anonymous User'}</h1>
        <p className="text-muted-foreground">{maskedEmail}</p>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="theme-switch">Dark Mode</label>
              <Switch id="theme-switch" defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="notification-switch">Email Notifications</label>
              <Switch id="notification-switch" />
            </div>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
