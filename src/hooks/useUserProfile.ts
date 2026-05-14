
'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { UserProfile } from '@/types/user';

const { db } = initializeFirebase();

/**
 * Real-time hook to fetch any user's profile data.
 */
export function useUserProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          setProfile({ uid: doc.id, ...doc.data() } as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { profile, loading, error };
}
