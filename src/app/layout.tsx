import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import BottomSheet from '@/components/BottomSheet';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'NoirManhwa | Read Modern Manhwa Online',
  description: 'Experience the ultimate manhwa reading platform with high-speed MangaDex integration.',
};

export const viewport: Viewport = {
  themeColor: '#050508',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground antialiased min-h-screen">
        <main className="pb-24 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {children}
        </main>
        <BottomNav />
        <BottomSheet />
        <Toaster />
      </body>
    </html>
  );
}