
import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import BottomSheet from '@/components/BottomSheet';
import WelcomeScreen from '@/components/WelcomeScreen';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import QueryProvider from '@/components/QueryProvider';

export const metadata: Metadata = {
  title: 'NoirManhwa | Modern Manhwa Discovery',
  description: 'Experience the ultimate manhwa reading platform with real-time MangaDex integration and elegant style.',
};

export const viewport: Viewport = {
  themeColor: '#020205',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-background text-foreground antialiased min-h-screen overflow-x-hidden">
        <QueryProvider>
          <FirebaseClientProvider>
            <WelcomeScreen />
            <main className="pb-28 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              {children}
            </main>
            <BottomNav />
            <BottomSheet />
            <Toaster />
          </FirebaseClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
