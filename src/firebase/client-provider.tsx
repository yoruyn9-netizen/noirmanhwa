
'use client';

import React, { useMemo, useEffect } from 'react';
import { initializeFirebase, FirebaseProvider } from './index';
import { enableDevAutoLogin } from '@/lib/devAuth';

/**
 * Enhanced Firebase Client Provider
 * Handles initialization and developer environment protocols.
 */
export const FirebaseClientProvider = ({ children }: { children: React.ReactNode }) => {
  const { app, db, auth } = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    // Initiate developer auto-login protocol
    enableDevAutoLogin();
  }, []);

  return (
    <FirebaseProvider app={app} db={db} auth={auth}>
      {children}
    </FirebaseProvider>
  );
};
